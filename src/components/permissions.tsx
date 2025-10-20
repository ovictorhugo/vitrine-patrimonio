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
 const hasPermissoes  = useMemo(() => has("PESMISSOES"), [has]);
 const hasAdministracaoDaComissao  = useMemo(() => has("ADMINISTRACAO_DA_COMISSAO"), [has]);

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
    hasAdministracaoDaComissao
  };
}
