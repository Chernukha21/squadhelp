BEGIN;
CREATE TABLE "Chats" (
                                 "_id" VARCHAR(24) PRIMARY KEY,
                                 "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                 "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "Messages" (
                            "_id" VARCHAR(24) PRIMARY KEY,
                            "sender" INTEGER NOT NULL
                                REFERENCES "Users" ("id")
                                    ON UPDATE CASCADE
                                    ON DELETE RESTRICT,
                            "body" TEXT NOT NULL,
                            "chat" VARCHAR(24) NOT NULL
                                REFERENCES "Chats" ("_id")
                                    ON UPDATE CASCADE
                                    ON DELETE RESTRICT,
                            "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "ConversationParticipants" (
                                            "chat" VARCHAR(24) NOT NULL,
                                            "userId" INTEGER NOT NULL,
                                            "blackList" BOOLEAN NOT NULL DEFAULT FALSE,
                                            "favoriteList" BOOLEAN NOT NULL DEFAULT FALSE,

                                            CONSTRAINT "conversation_participants_pk"
                                                PRIMARY KEY ("chat", "userId"),

                                            CONSTRAINT "conversation_participants_conversation_fk"
                                                FOREIGN KEY ("chat")
                                                    REFERENCES "Chats" ("_id")
                                                    ON UPDATE CASCADE
                                                    ON DELETE CASCADE,

                                            CONSTRAINT "conversation_participants_user_fk"
                                                FOREIGN KEY ("userId")
                                                    REFERENCES "Users" ("id")
                                                    ON UPDATE CASCADE
                                                    ON DELETE RESTRICT
);
CREATE TABLE "Catalogs" (
                            "_id" VARCHAR(24) PRIMARY KEY,
                            "userId" INTEGER NOT NULL,
                            "catalogName" TEXT NOT NULL,
                            "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            CONSTRAINT "catalogs_user_fk"
                                FOREIGN KEY ("userId")
                                    REFERENCES "Users" ("id")
                                    ON UPDATE CASCADE
                                    ON DELETE RESTRICT
);
CREATE TABLE "CatalogChats" (
                                "catalogId" VARCHAR(24) NOT NULL,
                                "chatId" VARCHAR(24) NOT NULL,

                                CONSTRAINT "catalog_chats_pk"
                                    PRIMARY KEY ("catalogId", "chatId"),

                                CONSTRAINT "catalog_chats_catalog_fk"
                                    FOREIGN KEY ("catalogId")
                                        REFERENCES "Catalogs" ("_id")
                                        ON UPDATE CASCADE
                                        ON DELETE CASCADE,

                                CONSTRAINT "catalog_chats_conversation_fk"
                                    FOREIGN KEY ("chatId")
                                        REFERENCES "Chats" ("_id")
                                        ON UPDATE CASCADE
                                        ON DELETE CASCADE
);
COMMIT;
