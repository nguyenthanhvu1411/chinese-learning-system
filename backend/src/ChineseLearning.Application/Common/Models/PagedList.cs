using System.Text.Json.Serialization;

namespace ChineseLearning.Application.Common.Models;

public sealed class PagedList<T>
{
    public IReadOnlyCollection<T> Items { get; init; } = Array.Empty<T>();
    public int PageNumber { get; init; }
    public int TotalPages { get; init; }
    public int TotalCount { get; init; }
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public PagedList() { }

    public PagedList(IReadOnlyCollection<T> items, int count, int pageNumber, int pageSize)
    {
        PageNumber = pageNumber;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
        TotalCount = count;
        Items = items;
    }
}
