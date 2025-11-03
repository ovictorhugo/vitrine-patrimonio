// src/hooks/usePermissions.ts
import { useContext, useMemo, useCallback } from "react";
import { UserContext } from "../context/context";

export function usePermissions() {
  const { permission } = useContext(UserContext);

  // 🔒 fallback seguro
  const perms = Array.isArray(permission) ? permission : [];

  // util genérica
  const has = useCallback(
    (code: string) => perms.some((p) => p.code === code),
    [perms]
  );

  const hasCriarEtiqueta       = useMemo(() => has("CRIAR_ETIQUETA"), [has]);
  const hasAnunciarItem        = useMemo(() => has("ANUNCIAR_ITEM"), [has]);
  const hasBuscaAvancada       = useMemo(() => has("BUSCA_AVANCADA"), [has]);
  const hasCargosFuncoes       = useMemo(() => has("CARGOS_E_FUNCOES"), [has]);
  const hasAlienacao           = useMemo(() => has("ALIENACAO"), [has]);
  const hasDesfazimento        = useMemo(() => has("DESFAZIMENTO"), [has]);
  const hasMovimentacao        = useMemo(() => has("MOVIMENTACAO"), [has]);
  const hasAdministrativo      = useMemo(() => has("ADMINISTRATIVO"), [has]);
  const hasComissaoPermanente  = useMemo(() => has("COMISSAO_PERMANENTE"), [has]);
 const hasPermissoes  = useMemo(() => has("PERMISSOES"), [has]);
 const hasAdministracaoDaComissao  = useMemo(() => has("ADMINISTRACAO_DA_COMISSAO"), [has]);
const hasColecoes = useMemo(() => has("COLECOES"), [has]);
const hasUsuarios = useMemo(() => has("USUARIOS"), [has]);
const hasDeletarUsuarios = useMemo(() => has("DELETAR_USUARIOS"), [has]);
const hasCatalogo = useMemo(() => has("CATALOGO"), [has]);
const hasConfiguracoes = useMemo(() => has("CONFIGURACOES"), [has]);
const hasDepartamento = useMemo(() => has("DEPARTAMENTO_SETOR"), [has]);
const hasComissaoApoioLocal = useMemo(() => has("COMISSAO_DE_APOIO_LOCAL"), [has]);
  const hasSalas = useMemo(() => has("SALAS"), [has]);
  const hasInventario = useMemo(() => has("INVENTARIO"), [has]);
  const hasFinalizados = useMemo(() => has("FINALIZADOS"), [has]);

return {
    has, // opcional: verificador dinâmico
    hasCriarEtiqueta,
    hasAnunciarItem,
    hasBuscaAvancada,
    hasCargosFuncoes,
    hasAlienacao,
    hasDesfazimento,
    hasMovimentacao,
    hasAdministrativo,
    hasComissaoPermanente,
    hasPermissoes,
    hasAdministracaoDaComissao,
    hasColecoes,
    hasUsuarios,
    hasDeletarUsuarios,
    hasCatalogo,
    hasConfiguracoes,
    hasDepartamento,
    hasComissaoApoioLocal,
    hasSalas,
    hasInventario,
    hasFinalizados
  };
}
