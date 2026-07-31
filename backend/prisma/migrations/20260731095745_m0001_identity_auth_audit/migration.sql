-- CreateEnum
CREATE TYPE "role_code" AS ENUM ('Administrator', 'DataEntryOperator', 'Engineer', 'Accounts', 'Viewer');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "login_id" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role_code" "role_code" NOT NULL,
    "mobile" VARCHAR(30),
    "email" VARCHAR(254),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_user_id" UUID,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by_user_id" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "last_seen_at" TIMESTAMPTZ(3),
    "ip_address" VARCHAR(64),
    "user_agent" VARCHAR(500),
    "revoked_at" TIMESTAMPTZ(3),

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remember_me_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "revoked_at" TIMESTAMPTZ(3),

    CONSTRAINT "remember_me_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID,
    "user_name_snapshot" VARCHAR(200),
    "module" VARCHAR(50) NOT NULL,
    "action" VARCHAR(80) NOT NULL,
    "details" TEXT,
    "entity_type" VARCHAR(50),
    "entity_id" UUID,
    "ip_address" VARCHAR(64),
    "request_id" VARCHAR(64),

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_users_role" ON "users"("role_code");

-- CreateIndex
CREATE INDEX "ix_users_active" ON "users"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "uq_users_login_id" ON "users"("login_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_token_hash_key" ON "auth_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "ix_auth_sessions_user" ON "auth_sessions"("user_id");

-- CreateIndex
CREATE INDEX "ix_auth_sessions_expires" ON "auth_sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "remember_me_tokens_token_hash_key" ON "remember_me_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "ix_remember_me_user" ON "remember_me_tokens"("user_id");

-- CreateIndex
CREATE INDEX "ix_audit_occurred" ON "audit_logs"("occurred_at");

-- CreateIndex
CREATE INDEX "ix_audit_user" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "ix_audit_module" ON "audit_logs"("module");

-- CreateIndex
CREATE INDEX "ix_audit_entity" ON "audit_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remember_me_tokens" ADD CONSTRAINT "remember_me_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
