namespace TechAsset.Application.Common.Models;

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => PageSize <= 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool TieneAnterior => Page > 1;
    public bool TieneSiguiente => Page < TotalPages;
}
