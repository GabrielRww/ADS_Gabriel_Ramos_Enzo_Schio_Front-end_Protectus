
export interface SegurosPendentesV2Res {
    apoliceId: number;
    desUsuario: string;
    cpfCliente: string;
    idSeguro: number;
    produtoNome: string;
    premioBruto: number;
    placa?: string | null;
    imei?: string | null;
    cib?: string | null;
    vlrProdutoSegurado: number | null;
    produtoSegurado: string | null;
    anoProdutoSegurado?: number | null;
    cidadeProdutoSegurado?: string | null;
    parcelas: number;
    vlrParcela: number;
    status: string;
}

export class EfetivaSeguroDto {
    idApolice: number;
    cpfCliente?: string;
    idSeguro: number;
    placa?: string;
    imei?: string;
    cib?: string;
    status: number;
}
