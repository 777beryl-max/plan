import { getDB } from "@/lib/db/dexie";
import type { UserDataBundle } from "@/lib/sync/types";
import { createBaseEntity, nowISO } from "@/lib/utils";
import type { UserProfile } from "@/lib/types";

export async function exportUserDataBundle(): Promise<UserDataBundle> {
  const db = getDB();
  const [
    goals,
    monthPlans,
    weekPlans,
    dayTasks,
    pomodoroSessions,
    companions,
    companionProgress,
    companionRewardLogs,
    adventurerRewardLogs,
    userProfiles,
    weeklyReports,
  ] = await Promise.all([
    db.goals.toArray(),
    db.monthPlans.toArray(),
    db.weekPlans.toArray(),
    db.dayTasks.toArray(),
    db.pomodoroSessions.toArray(),
    db.companions.toArray(),
    db.companionProgress.toArray(),
    db.companionRewardLogs.toArray(),
    db.adventurerRewardLogs.toArray(),
    db.userProfiles.toArray(),
    db.weeklyReports.toArray(),
  ]);

  return {
    goals,
    monthPlans,
    weekPlans,
    dayTasks,
    pomodoroSessions,
    companions,
    companionProgress,
    companionRewardLogs,
    adventurerRewardLogs,
    userProfiles,
    weeklyReports,
    exportedAt: nowISO(),
  };
}

export async function importUserDataBundle(
  bundle: UserDataBundle,
  userId: string,
  displayName: string
): Promise<void> {
  const db = getDB();

  await db.transaction("rw", db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));

    if (bundle.goals.length) await db.goals.bulkPut(bundle.goals);
    if (bundle.monthPlans.length) await db.monthPlans.bulkPut(bundle.monthPlans);
    if (bundle.weekPlans.length) await db.weekPlans.bulkPut(bundle.weekPlans);
    if (bundle.dayTasks.length) await db.dayTasks.bulkPut(bundle.dayTasks);
    if (bundle.pomodoroSessions.length) await db.pomodoroSessions.bulkPut(bundle.pomodoroSessions);
    if (bundle.companions.length) await db.companions.bulkPut(bundle.companions);
    if (bundle.companionProgress?.length) await db.companionProgress.bulkPut(bundle.companionProgress);
    if (bundle.companionRewardLogs?.length) await db.companionRewardLogs.bulkPut(bundle.companionRewardLogs);
    if (bundle.adventurerRewardLogs?.length) await db.adventurerRewardLogs.bulkPut(bundle.adventurerRewardLogs);
    if (bundle.weeklyReports.length) await db.weeklyReports.bulkPut(bundle.weeklyReports);

    const profile =
      bundle.userProfiles[0] ??
      ({
        ...createBaseEntity(),
        id: userId,
        displayName,
        onboardingDone: false,
      } satisfies UserProfile);

    await db.userProfiles.put({
      ...profile,
      id: userId,
      displayName: profile.displayName || displayName,
    });
  });
}

export async function clearLocalUserData(): Promise<void> {
  const db = getDB();
  await db.transaction("rw", db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()));
  });
}
