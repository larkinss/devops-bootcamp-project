# =============================================================================
# SSH KEY PAIR (for internal SSH: Ansible controller -> web/monitoring servers)
# Private key is saved locally so Ansible can use it later. It is NOT committed
# to git (see .gitignore).
# =============================================================================

resource "tls_private_key" "devops" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "devops" {
  key_name   = "devops-bootcamp-key"
  public_key = tls_private_key.devops.public_key_openssh

  tags = {
    Name = "devops-bootcamp-key"
  }
}

resource "local_sensitive_file" "private_key" {
  content         = tls_private_key.devops.private_key_pem
  filename        = "${path.module}/devops-bootcamp-key.pem"
  file_permission = "0400"
}
