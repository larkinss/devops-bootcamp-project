
# =============================================================================
# PUBLIC SECURITY GROUP
# Port 80  : from anywhere (public web access)
# Port 9100: from monitoring server only (node_exporter scrape target)
# Port 22  : from within the VPC only (internal SSH, e.g. Ansible controller)
# =============================================================================

resource "aws_security_group" "public" {
  name        = "devops-public-sg"
  description = "Security group for the public web server"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Node exporter scrape from monitoring server only"
    from_port   = 9100
    to_port     = 9100
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.136/32"]
  }

  ingress {
    description = "SSH from within the VPC only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/24"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "devops-public-sg"
  }
}

# =============================================================================
# PRIVATE SECURITY GROUP
# Port 22 : from within the VPC only (internal SSH, e.g. Ansible controller
#           reaching the monitoring server)
# =============================================================================

resource "aws_security_group" "private" {
  name        = "devops-private-sg"
  description = "Security group for private servers (controller, monitoring)"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH from within the VPC only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/24"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "devops-private-sg"
  }
}
