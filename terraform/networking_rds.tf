##############################
# VPC & Subnets
##############################

data "aws_vpc" "default" {
  default = true
}

resource "aws_vpc" "custom" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "proj04-custom"
  }
}

moved {
  from = aws_subnet.allowed
  to   = aws_subnet.private1
}

resource "aws_subnet" "private1" {
  vpc_id            = aws_vpc.custom.id
  cidr_block        = "10.0.0.0/24"
  availability_zone = "ap-southeast-2a"

  tags = {
    Name   = "subnet-custom-vpc-private1"
    Access = "private"
  }
}

resource "aws_subnet" "private2" {
  vpc_id            = aws_vpc.custom.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "ap-southeast-2b"

  tags = {
    Name   = "subnet-custom-vpc-private2"
    Access = "private"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.custom.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "ap-southeast-2a"
  map_public_ip_on_launch = true

  tags = {
    Name   = "subnet-custom-vpc-public1"
    Access = "public"
  }
}

resource "aws_subnet" "public1" {
  vpc_id                  = aws_vpc.custom.id
  cidr_block              = "10.0.10.0/24"
  availability_zone       = "ap-southeast-2a"
  map_public_ip_on_launch = true

  tags = {
    Name   = "subnet-custom-vpc-public1"
    Access = "public"
  }
}

resource "aws_subnet" "public2" {
  vpc_id                  = aws_vpc.custom.id
  cidr_block              = "10.0.11.0/24"
  availability_zone       = "ap-southeast-2b"
  map_public_ip_on_launch = true

  tags = {
    Name   = "subnet-custom-vpc-public2"
    Access = "public"
  }
}

##############################
# Internet Gateway & Routing
##############################

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.custom.id

  tags = {
    Name = "proj04-igw"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.custom.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "proj04-public-rt"
  }
}

resource "aws_route_table_association" "public1" {
  subnet_id      = aws_subnet.public1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public2" {
  subnet_id      = aws_subnet.public2.id
  route_table_id = aws_route_table.public.id
}

# For documentation. Not actively used.
# resource "aws_subnet" "not_allowed" {
#   vpc_id     = data.aws_vpc.default.id
#   cidr_block = "172.31.128.0/24"

#   tags = {
#     Name = "subnet-default-vpc"
#   }
# }

##############################
# Security Groups
##############################

# 1. Source security group - From where traffic is allowed
# 2. Compliant security group
#   2.1 Security group rule
# 3. Non-compliant security group
#   3.1 Security group rule

resource "aws_security_group" "source" {
  name        = "source-sg"
  description = "SG from where connections are allowed into the DB"
  vpc_id      = aws_vpc.custom.id
}

resource "aws_security_group" "compliant" {
  name        = "compliant-sg"
  description = "Compliant security group"
  vpc_id      = aws_vpc.custom.id

  tags = {
    Name   = "compliant-sg"
    Access = "private"
  }
}

resource "aws_vpc_security_group_ingress_rule" "db" {
  security_group_id            = aws_security_group.compliant.id
  referenced_security_group_id = aws_security_group.source.id
  from_port                    = 3306
  to_port                      = 3306
  ip_protocol                  = "tcp"
}

# Allow public access to MySQL (for ECS connection)
resource "aws_vpc_security_group_ingress_rule" "db_public" {
  security_group_id = aws_security_group.compliant.id
  cidr_ipv4 = "123.21.155.116/32"  # Your current IP
  from_port         = 3306
  to_port           = 3306
  ip_protocol       = "tcp"
  description       = "Allow MySQL access from current IP"
}

resource "aws_security_group" "non_compliant" {
  name        = "non-compliant-sg"
  description = "Non-compliant security group"
  vpc_id      = aws_vpc.custom.id
}

resource "aws_vpc_security_group_ingress_rule" "https" {
  security_group_id = aws_security_group.non_compliant.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
}