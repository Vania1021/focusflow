import { Request, Response } from "express";
import { Progress } from "../models/progress";
import { ProgressContainer } from "../lib/db.config";
import { today, yesterday } from "../utils/date";

export const getOrInitProgress = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const now = new Date().toISOString();
  const todayDate = today();

  const { resource } = await ProgressContainer
    .item(userId, userId)
    .read<Progress>();

  // First-time dashboard load → create progress
  if (!resource) {
    const progress: Progress = {
      id: userId,
      userId,
      focusStreak: 1,
      completedSessions: 0,
      skills: {},
      lastActive: now,
      lastStreakDate: todayDate,
      createdAt: now,
      updatedAt: now,
    };

    await ProgressContainer.items.create(progress);
    return res.status(201).json(progress);
  }

  // 🔥 STREAK LOGIC
  let streak = resource.focusStreak;

  if (resource.lastStreakDate === todayDate) {
    // already counted today → do nothing
  } else if (resource.lastStreakDate === yesterday()) {
    streak += 1;
  } else {
    streak = 1; // streak broken
  }

  const updated: Progress = {
    ...resource,
    focusStreak: streak,
    lastStreakDate: todayDate,
    lastActive: now,
    updatedAt: now,
  };

  await ProgressContainer
    .item(userId, userId)
    .replace(updated);

  res.json(updated);
};
