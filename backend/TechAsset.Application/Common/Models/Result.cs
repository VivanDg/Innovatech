namespace TechAsset.Application.Common.Models;

public class Result
{
    protected Result(bool esExito, IReadOnlyList<Error> errores)
    {
        EsExito = esExito;
        Errores = errores;
    }

    public bool EsExito { get; }
    public bool EsFallo => !EsExito;
    public IReadOnlyList<Error> Errores { get; }
    public Error ErrorPrincipal => Errores.FirstOrDefault() ?? new Error("ERROR", "Ocurrió un error.");

    public static Result Success() => new(true, Array.Empty<Error>());

    public static Result Failure(Error error) => new(false, new[] { error });

    public static Result Failure(IEnumerable<Error> errores)
    {
        var lista = errores.ToList();
        return new Result(false, lista.Count == 0 ? new[] { new Error("ERROR", "Ocurrió un error.") } : lista);
    }

    public static Result NotFound(string mensaje) => Failure(new Error("NO_ENCONTRADO", mensaje));

    public static Result Conflict(string codigo, string mensaje) => Failure(new Error(codigo, mensaje));

    public static Result Forbidden(string mensaje) => Failure(new Error("PROHIBIDO", mensaje));
}

public sealed class Result<T> : Result
{
    private Result(bool esExito, T? valor, IReadOnlyList<Error> errores) : base(esExito, errores)
    {
        Valor = valor;
    }

    public T? Valor { get; }

    public static Result<T> Success(T valor) => new(true, valor, Array.Empty<Error>());

    public new static Result<T> Failure(Error error) => new(false, default, new[] { error });

    public new static Result<T> Failure(IEnumerable<Error> errores)
    {
        var lista = errores.ToList();
        return new Result<T>(false, default, lista.Count == 0 ? new[] { new Error("ERROR", "Ocurrió un error.") } : lista);
    }

    public new static Result<T> NotFound(string mensaje) => Failure(new Error("NO_ENCONTRADO", mensaje));

    public new static Result<T> Conflict(string codigo, string mensaje) => Failure(new Error(codigo, mensaje));

    public new static Result<T> Forbidden(string mensaje) => Failure(new Error("PROHIBIDO", mensaje));
}
