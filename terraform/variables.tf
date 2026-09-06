variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Name/suffix used across resource naming"
  type        = string
  default     = "larkinss"
}