module "database" {
  source       = "./module/rds"
  project_name = "dumamay"

  security_group_ids = [
    aws_security_group.compliant.id
  ]
  subnet_ids = [
    aws_subnet.public.id,
    aws_subnet.public2.id
  ]


  credentials = {
    username = "admin"
    password = "Minhchau3112..."
  }

}
