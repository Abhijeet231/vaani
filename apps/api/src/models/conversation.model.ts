import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '../config/db';
import { conversations } from '../db/schema';

interface CreateConversationInput {
  userId: string;
  sourceLanguage: string;
  targetLanguage: string;
  transcript: string;
  translatedText: string;
}

export async function createConversation(input: CreateConversationInput) {
  const db = getDb();
  const [created] = await db.insert(conversations).values(input).returning();
  return created;
}

export async function listConversations(userId: string) {
  const db = getDb();
  return db.query.conversations.findMany({
    where: eq(conversations.userId, userId),
    orderBy: [desc(conversations.createdAt)],
  });
}

export async function deleteConversation(id: string, userId: string) {
  const db = getDb();
  const [deleted] = await db
    .delete(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
    .returning();
  return deleted;
}
