# =============================================================================
# ECR REPOSITORY
# =============================================================================

resource "aws_ecr_repository" "app" {
  name                 = "devops-bootcamp/final-project-${var.project_name}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "devops-bootcamp-final-project-${var.project_name}"
  }
}

# Allow the SSM role (used by all 3 EC2 instances) to push/pull images
resource "aws_iam_role_policy" "ecr_access" {
  name = "devops-ecr-access-policy"
  role = aws_iam_role.ssm.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "ecr:GetAuthorizationToken"
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ]
        Resource = aws_ecr_repository.app.arn
      }
    ]
  })
}

output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}
