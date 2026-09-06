# =============================================================================
# BOOTSTRAP RESOURCE — Terraform state bucket
# =============================================================================
# This bucket stores the Terraform state itself. On first-time setup, apply
# this WITHOUT the `backend "s3" {}` block active (see versions.tf), using
# local state, then migrate to the S3 backend once the bucket exists.
# =============================================================================

resource "aws_s3_bucket" "tfstate" {
  bucket = "devops-bootcamp-terraform-${var.project_name}"

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name    = "devops-bootcamp-terraform-${var.project_name}"
    Purpose = "terraform-state"
    Project = "devops-bootcamp-project"
  }
}

resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}