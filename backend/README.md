# Backend

ASP.NET Core 8 Web API cho Chinese Learning System.

## Chạy local

```bash
dotnet restore ChineseLearning.sln
dotnet run --project src/ChineseLearning.Api
```

Development dùng giá trị mẫu an toàn trong `appsettings.Development.json`. Staging và Production phải cấp cấu hình bằng environment variables hoặc secret manager.

## Biến môi trường bắt buộc

```text
Database__ConnectionString
Supabase__Url
Supabase__JwtIssuer
Supabase__JwtAudience
OpenAI__ApiKey
OpenAI__Model
OpenAI__BaseUrl
```

Ví dụ dùng .NET User Secrets:

```bash
dotnet user-secrets init --project src/ChineseLearning.Api
dotnet user-secrets set "Database:ConnectionString" "..." --project src/ChineseLearning.Api
dotnet user-secrets set "Supabase:Url" "https://PROJECT.supabase.co" --project src/ChineseLearning.Api
dotnet user-secrets set "Supabase:JwtIssuer" "https://PROJECT.supabase.co/auth/v1" --project src/ChineseLearning.Api
dotnet user-secrets set "OpenAI:ApiKey" "..." --project src/ChineseLearning.Api
```

Không commit API key, database password, service-role key hoặc JWT secret. Ứng dụng xác thực cấu hình khi khởi động và từ chối chạy nếu thiếu Supabase hoặc database settings.

## Kiểm tra

```bash
dotnet build ChineseLearning.sln
dotnet test ChineseLearning.sln
docker build -t chinese-learning-api .
```
