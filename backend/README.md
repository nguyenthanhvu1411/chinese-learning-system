# Backend

ASP.NET Core 8 Web API cho Chinese Learning System.

## Chạy local

```bash
dotnet restore ChineseLearning.sln
dotnet run --project src/ChineseLearning.Api
```

OpenAI API key phải được đặt bằng environment variable `OpenAI__ApiKey` hoặc .NET User Secrets. Không commit key vào repository.

## Kiểm tra

```bash
dotnet build ChineseLearning.sln
dotnet test ChineseLearning.sln
docker build -t chinese-learning-api .
```
