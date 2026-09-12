# =============================================================================
# AMI: Amazon Linux 2023 (latest, official Amazon-owned image)
# =============================================================================

data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# =============================================================================
# WEB SERVER (public subnet, 10.0.0.5)
# =============================================================================

resource "aws_instance" "web_server" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public.id
  private_ip             = "10.0.0.5"
  vpc_security_group_ids = [aws_security_group.public.id]
  key_name               = aws_key_pair.devops.key_name
  iam_instance_profile   = aws_iam_instance_profile.ssm.name

  tags = {
    Name = "devops-web-server"
  }
}

resource "aws_eip" "web_server" {
  domain   = "vpc"
  instance = aws_instance.web_server.id

  tags = {
    Name = "devops-web-server-eip"
  }

  depends_on = [aws_internet_gateway.main]
}

# =============================================================================
# ANSIBLE CONTROLLER (private subnet, 10.0.0.135)
# =============================================================================

resource "aws_instance" "controller" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.private.id
  private_ip             = "10.0.0.135"
  vpc_security_group_ids = [aws_security_group.private.id]
  key_name               = aws_key_pair.devops.key_name
  iam_instance_profile   = aws_iam_instance_profile.ssm.name

  tags = {
    Name = "devops-controller"
  }
}

# =============================================================================
# MONITORING SERVER (private subnet, 10.0.0.136)
# =============================================================================

resource "aws_instance" "monitoring" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.private.id
  private_ip             = "10.0.0.136"
  vpc_security_group_ids = [aws_security_group.private.id]
  key_name               = aws_key_pair.devops.key_name
  iam_instance_profile   = aws_iam_instance_profile.ssm.name

  tags = {
    Name = "devops-monitoring"
  }
}
