// src/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";

import { Home } from "./pages/Home";
import { usePermissions } from "./components/permissions";
import { Admin } from "./pages/Admin";
import { Authentication } from "./pages/Authentication";
import { AuthenticationToken } from "./pages/Authentication-token";
import ProtectedRoute from "./components/ProtectedRoute";
import { Error404 } from "./components/errors/404";
import { Unauthorized } from "./components/errors/Unauthorized";

export function AppRoutes({ loggedIn }: { loggedIn: boolean }) {
  const {
    hasCriarEtiqueta,
    hasAnunciarItem,
    hasBuscaAvancada,
    hasCargosFuncoes,
    hasAlienacao,
    hasDesfazimento,
    hasMovimentacao,
    hasAdministrativo,
    hasComissaoPermanente,
    hasDepartamento,
    hasComissaoApoioLocal,
    hasFinalizados,
    hasAudiovisual,
    hasSalas,
    hasAcervoHistorico,
  } = usePermissions();

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/buscar-patrimonio" element={<Home />} />
      <Route path="/buscar-catalogo" element={<Home />} />
      <Route path="/item" element={<Home />} />
      <Route path="/informacoes" element={<Home />} />

      {/* Rotas de dashboard (livres ou públicas dentro do painel) */}
      <Route path="/dashboard" element={<Admin />} />
      <Route path="/dashboard/patrimonios" element={<Admin />} />
      <Route path="/dashboard/desfazimento-bem" element={<Admin />} />
      <Route path="/dashboard/sala" element={<Admin />} />
      <Route path="/dashboard/itens-vitrine" element={<Admin />} />
      <Route path="/dashboard/itens-desfazimento" element={<Admin />} />
      <Route path="/dashboard/transferencias" element={<Admin />} />
      <Route path="/dashboard/editar-item" element={<Admin />} />
      <Route path="/dashboard/inventario" element={<Admin />} />
      <Route path="/dashboard/painel" element={<Admin />} />

      <Route path="/user" element={<Admin />} />

      <Route path="/termo-uso" element={<Admin />} />
      <Route path="/politica-privacidade" element={<Admin />} />

      {/* Login / autenticação */}
      <Route
        path="/signIn"
        element={loggedIn === false ? <Authentication /> : <Navigate to="/" />}
      />
      <Route path="/authentication" element={<AuthenticationToken />} />

      {/* Rotas com permissão */}
      <Route
        path="/dashboard/criar-etiqueta"
        element={
          <ProtectedRoute
            element={<Admin />}
            hasPermission={hasCriarEtiqueta}
          />
        }
      />

      <Route
        path="/dashboard/novo-item"
        element={
          <ProtectedRoute element={<Admin />} hasPermission={hasAnunciarItem} />
        }
      />

      <Route
        path="/dashboard/audiovisual"
        element={
          <ProtectedRoute element={<Admin />} hasPermission={hasAudiovisual} />
        }
      />

      <Route
        path="/dashboard/salas"
        element={
          <ProtectedRoute element={<Admin />} hasPermission={hasSalas} />
        }
      />

      <Route
        path="/dashboard/acervo-historico"
        element={
          <ProtectedRoute
            element={<Admin />}
            hasPermission={hasAcervoHistorico}
          />
        }
      />

      <Route
        path="/dashboard/emprestimo-audiovisual"
        element={
          <ProtectedRoute
            element={<Admin />}
            hasPermission={hasAudiovisual}
          />
        }
      />

      <Route
        path="/pedir-emprestimo-audiovisual"
        element={<ProtectedRoute element={<Home />} hasPermission={loggedIn} />}
      />

      <Route
        path="/dashboard/busca-avancada"
        element={
          <ProtectedRoute
            element={<Admin />}
            hasPermission={hasBuscaAvancada}
          />
        }
      />

      <Route
        path="/dashboard/cargos-funcoes"
        element={
          <ProtectedRoute
            element={<Admin />}
            hasPermission={hasCargosFuncoes}
          />
        }
      />

      <Route
        path="/dashboard/finalizados"
        element={
          <ProtectedRoute element={<Admin />} hasPermission={hasFinalizados} />
        }
      />

      <Route
        path="/dashboard/alienacao"
        element={
          <ProtectedRoute element={<Admin />} hasPermission={hasAlienacao} />
        }
      />

      <Route
        path="/dashboard/desfazimento"
        element={
          <ProtectedRoute element={<Admin />} hasPermission={hasDesfazimento} />
        }
      />

      <Route
        path="/dashboard/setor-departamento"
        element={
          <ProtectedRoute element={<Admin />} hasPermission={hasDepartamento} />
        }
      />

      <Route
        path="/dashboard/movimentacao"
        element={
          <ProtectedRoute element={<Admin />} hasPermission={hasMovimentacao} />
        }
      />

      <Route
        path="/dashboard/administrativo"
        element={
          <ProtectedRoute
            element={<Admin />}
            hasPermission={hasAdministrativo}
          />
        }
      />

      <Route
        path="/dashboard/comissao-permanente"
        element={
          <ProtectedRoute
            element={<Admin />}
            hasPermission={hasComissaoPermanente}
          />
        }
      />

      <Route
        path="/dashboard/comissao-apoio-local"
        element={
          <ProtectedRoute
            element={<Admin />}
            hasPermission={hasComissaoApoioLocal}
          />
        }
      />

      {/* Outras rotas do dashboard */}
      <Route
        path="/dashboard/criar-patrimonio-temporario"
        element={<Admin />}
      />
      <Route path="/dashboard/patrimonio-temporario" element={<Admin />} />

      {/* Rotas de erro e acesso negado */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
}
