-- CreateTable
CREATE TABLE "messages" (
    "message_id" BIGINT NOT NULL,
    "chat_id" BIGINT NOT NULL,
    "telegram_user_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "messages_message_id_key" ON "messages"("message_id");
