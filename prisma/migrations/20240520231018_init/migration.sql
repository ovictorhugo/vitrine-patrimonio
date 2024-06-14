-- CreateTable
CREATE TABLE "Alunos" (
    "mat_aluno" CHAR(15),
    "nom_aluno" VARCHAR(100) NOT NULL,
    "telcel_aluno" CHAR(9),
    "cpf_aluno" CHAR(16) NOT NULL,
    "datnsc_aluno" DATE,
    "pai_aluno" VARCHAR(60),
    "mae_aluno" VARCHAR(60),
    "cod_curso" VARCHAR(50),
    "ano_sem_ing_aluno" CHAR(7),
    "datnsc_pai_aluno" DATE,
    "datnsc_mae_aluno" DATE,
    "email" VARCHAR(50),

    CONSTRAINT "Alunos_pkey" PRIMARY KEY ("cpf_aluno")
);
