output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.web.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.web.public_dns
}

output "ecr_repository_url" {
  description = "The URL of the created ECR repository"
  value       = aws_ecr_repository.my_app.repository_url
}
