# =============================================================================
# ALLOW THE CONTROLLER TO INITIATE SSM SESSIONS TO OTHER INSTANCES
# AmazonSSMManagedInstanceCore only lets an instance BE managed via SSM.
# The Ansible controller also needs permission to START sessions TO the
# web/monitoring instances (this is what the aws_ssm connection plugin does).
# =============================================================================

data "aws_caller_identity" "current" {}

resource "aws_iam_role_policy" "ssm_session_control" {
  name = "devops-ssm-session-control-policy"
  role = aws_iam_role.ssm.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:StartSession"
        ]
        Resource = [
          "arn:aws:ec2:${var.aws_region}:*:instance/${aws_instance.web_server.id}",
          "arn:aws:ec2:${var.aws_region}:*:instance/${aws_instance.monitoring.id}",
          "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:document/SSM-SessionManagerRunShell",
          "arn:aws:ssm:${var.aws_region}::document/SSM-SessionManagerRunShell"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:TerminateSession",
          "ssm:ResumeSession",
          "ssm:DescribeSessions",
          "ssm:GetConnectionStatus"
        ]
        Resource = "*"
      }
    ]
  })
}
