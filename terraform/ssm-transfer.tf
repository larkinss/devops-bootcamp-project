# =============================================================================
# S3 BUCKET FOR ANSIBLE SSM CONNECTION PLUGIN
# The aws_ssm connection plugin stages files here when Ansible pushes tasks/
# modules from the controller to the web/monitoring servers over SSM.
# =============================================================================

resource "aws_s3_bucket" "ssm_transfer" {
  bucket        = "devops-bootcamp-ssm-transfer-${var.project_name}"
  force_destroy = true # ok to wipe on destroy, this only holds transient files

  tags = {
    Name    = "devops-bootcamp-ssm-transfer-${var.project_name}"
    Purpose = "ansible-ssm-file-transfer"
  }
}

resource "aws_s3_bucket_public_access_block" "ssm_transfer" {
  bucket = aws_s3_bucket.ssm_transfer.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "ssm_transfer" {
  bucket = aws_s3_bucket.ssm_transfer.id

  rule {
    id     = "expire-old-transfers"
    status = "Enabled"

    filter {}

    expiration {
      days = 1
    }
  }
}

# Allow the SSM role to read/write to the transfer bucket
resource "aws_iam_role_policy" "ssm_transfer" {
  name = "devops-ssm-transfer-policy"
  role = aws_iam_role.ssm.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:GetEncryptionConfiguration"
        ]
        Resource = [
          aws_s3_bucket.ssm_transfer.arn,
          "${aws_s3_bucket.ssm_transfer.arn}/*"
        ]
      }
    ]
  })
}
