terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.5"
    }
  }

  # NOTE: The S3 bucket referenced below must exist BEFORE this block is active.
  # Bootstrap flow:
  #   1. Comment out this backend block (Terraform will use local state)
  #   2. terraform init && terraform apply -target=aws_s3_bucket.tfstate
  #   3. Uncomment this block
  #   4. terraform init -migrate-state
  backend "s3" {
    bucket       = "devops-bootcamp-terraform-larkinss"
    key          = "final-project/terraform.tfstate"
    region       = "ap-southeast-1"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = var.aws_region
}
