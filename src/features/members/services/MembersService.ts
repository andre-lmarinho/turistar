import "server-only";

import type { PlanIdentity, PlanRepository } from "@/features/plan/repositories/PlanRepository";
import type { ProfileRepository } from "@/features/profile/repositories/ProfileRepository";
import { ApplicationError } from "@/lib/errors";

import type { MembersRepository } from "../repositories/MembersRepository";
import type { AddMemberResult, ShareMembersData, ShareTier } from "../types";

export class MembersService {
  constructor(
    private readonly repo: MembersRepository,
    private readonly planRepo: PlanRepository,
    private readonly profileRepo: ProfileRepository
  ) {}

  private async resolvePlan(planId: string): Promise<PlanIdentity | null> {
    return this.planRepo.fetchPlanIdentityById(planId);
  }

  private assertPlanFound(
    plan: PlanIdentity | null,
    operation: string,
    planId: string
  ): asserts plan is PlanIdentity {
    if (!plan) {
      throw new ApplicationError("NOT_FOUND", `${operation}: plan not found`, { cause: { planId } });
    }
  }

  async getMembers(planId: string): Promise<ShareMembersData> {
    const plan = await this.resolvePlan(planId);
    this.assertPlanFound(plan, "getMembers", planId);

    const members = await this.repo.fetchMembers(plan.id);
    const ownerId = plan.ownerId;

    if (ownerId && !members.some((member) => member.userId === ownerId)) {
      const ownerProfile = await this.profileRepo.fetchProfileByUserId(ownerId);
      members.unshift({
        userId: ownerId,
        tier: "admin",
        slug: ownerProfile?.slug ?? null,
        displayName: ownerProfile?.displayName ?? null,
        avatarUrl: ownerProfile?.avatarUrl ?? null,
      });
    }

    return { ownerId, members };
  }

  async addMember(planId: string, email: string, tier: ShareTier): Promise<AddMemberResult> {
    const plan = await this.resolvePlan(planId);
    this.assertPlanFound(plan, "addMember", planId);
    return this.repo.addMemberByEmail(plan.id, email, tier);
  }

  async updateMemberTier(planId: string, userId: string, tier: ShareTier): Promise<void> {
    const plan = await this.resolvePlan(planId);
    this.assertPlanFound(plan, "updateMemberTier", planId);
    await this.repo.updateMemberTier(plan.id, userId, tier);
  }

  async removeMember(planId: string, userId: string): Promise<void> {
    const plan = await this.resolvePlan(planId);
    this.assertPlanFound(plan, "removeMember", planId);
    await this.repo.removeMember(plan.id, userId);
  }

  async leavePlan(planId: string): Promise<void> {
    const plan = await this.resolvePlan(planId);
    this.assertPlanFound(plan, "leavePlan", planId);
    await this.repo.leavePlan(plan.id);
  }
}
