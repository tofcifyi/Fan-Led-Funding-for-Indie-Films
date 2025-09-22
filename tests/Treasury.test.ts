import { describe, it, expect, beforeEach } from "vitest";
import { uintCV } from "@stacks/transactions";

const ERR_NOT_AUTHORIZED = 100;
const ERR_PROPOSAL_NOT_APPROVED = 101;
const ERR_INSUFFICIENT_FUNDS = 102;
const ERR_INVALID_MILESTONE = 103;
const ERR_INVALID_AMOUNT = 104;
const ERR_TREASURY_PAUSED = 105;
const ERR_INVALID_PROPOSAL_ID = 106;
const ERR_ALREADY_CONTRIBUTED = 107;
const ERR_PROPOSAL_EXPIRED = 108;
const ERR_INVALID_RECIPIENT = 109;
const ERR_MAX_CONTRIBUTIONS_EXCEEDED = 110;
const ERR_INVALID_TIMESTAMP = 111;
const ERR_ORACLE_NOT_VERIFIED = 112;
const ERR_INVALID_ROYALTY_RATE = 113;
const ERR_INVALID_WITHDRAWAL = 114;
const ERR_EMERGENCY_WITHDRAWAL_NOT_ALLOWED = 115;
const ERR_INVALID_STATUS = 116;
const ERR_MAX_PROPOSALS_EXCEEDED = 117;
const ERR_INVALID_CURRENCY = 118;
const ERR_INVALID_INTEREST_RATE = 119;
const ERR_INVALID_GRACE_PERIOD = 120;

interface Result<T> {
	ok: boolean;
	value: T;
}

class TreasuryMock {
	state: {
		treasuryBalance: number;
		paused: boolean;
		admin: string;
		oracle: string;
		maxContributionsPerUser: number;
		royaltyRate: number;
		nextProposalId: number;
		maxProposals: number;
		emergencyWithdrawalEnabled: boolean;
		contributions: Map<string, number>;
		projectFunds: Map<number, number>;
		projectStatus: Map<number, boolean>;
		projectMilestones: Map<number, number[]>;
		projectRecipients: Map<number, string>;
		projectExpiry: Map<number, number>;
		userContributionCount: Map<string, number>;
		projectRoyalties: Map<number, number>;
		projectInterestRates: Map<number, number>;
		projectGracePeriods: Map<number, number>;
		projectCurrencies: Map<number, string>;
	} = {
		treasuryBalance: 0,
		paused: false,
		admin: "ST1ADMIN",
		oracle: "ST1ORACLE",
		maxContributionsPerUser: 10,
		royaltyRate: 10,
		nextProposalId: 0,
		maxProposals: 100,
		emergencyWithdrawalEnabled: false,
		contributions: new Map(),
		projectFunds: new Map(),
		projectStatus: new Map(),
		projectMilestones: new Map(),
		projectRecipients: new Map(),
		projectExpiry: new Map(),
		userContributionCount: new Map(),
		projectRoyalties: new Map(),
		projectInterestRates: new Map(),
		projectGracePeriods: new Map(),
		projectCurrencies: new Map(),
	};
	blockHeight: number = 0;
	caller: string = "ST1TEST";
	stxTransfers: Array<{ amount: number; from: string; to: string }> = [];

	constructor() {
		this.reset();
	}

	reset() {
		this.state = {
			treasuryBalance: 0,
			paused: false,
			admin: "ST1ADMIN",
			oracle: "ST1ORACLE",
			maxContributionsPerUser: 10,
			royaltyRate: 10,
			nextProposalId: 0,
			maxProposals: 100,
			emergencyWithdrawalEnabled: false,
			contributions: new Map(),
			projectFunds: new Map(),
			projectStatus: new Map(),
			projectMilestones: new Map(),
			projectRecipients: new Map(),
			projectExpiry: new Map(),
			userContributionCount: new Map(),
			projectRoyalties: new Map(),
			projectInterestRates: new Map(),
			projectGracePeriods: new Map(),
			projectCurrencies: new Map(),
		};
		this.blockHeight = 0;
		this.caller = "ST1TEST";
		this.stxTransfers = [];
	}

	isAdmin(caller: string): boolean {
		return caller === this.state.admin;
	}

	isOracle(caller: string): boolean {
		return caller === this.state.oracle;
	}

	isProposalApproved(id: number): Result<boolean> {
		return { ok: true, value: true };
	}

	getMilestoneStatus(id: number, milestone: number): Result<boolean> {
		return { ok: true, value: true };
	}

	contribute(amount: number): Result<boolean> {
		if (this.state.paused) return { ok: false, value: ERR_TREASURY_PAUSED };
		if (amount <= 0) return { ok: false, value: ERR_INVALID_AMOUNT };
		const count = this.state.userContributionCount.get(this.caller) || 0;
		if (count >= this.state.maxContributionsPerUser)
			return { ok: false, value: ERR_MAX_CONTRIBUTIONS_EXCEEDED };
		this.stxTransfers.push({ amount, from: this.caller, to: "contract" });
		this.state.treasuryBalance += amount;
		const current = this.state.contributions.get(this.caller) || 0;
		this.state.contributions.set(this.caller, current + amount);
		this.state.userContributionCount.set(this.caller, count + 1);
		return { ok: true, value: true };
	}

	allocateFunds(
		proposalId: number,
		amount: number,
		recipient: string,
		expiry: number,
		currency: string,
		interestRate: number,
		gracePeriod: number
	): Result<boolean> {
		if (!this.isAdmin(this.caller))
			return { ok: false, value: ERR_NOT_AUTHORIZED };
		if (proposalId >= this.state.nextProposalId)
			return { ok: false, value: ERR_INVALID_PROPOSAL_ID };
		if (amount <= 0) return { ok: false, value: ERR_INVALID_AMOUNT };
		if (recipient === this.caller)
			return { ok: false, value: ERR_INVALID_RECIPIENT };
		if (expiry < this.blockHeight)
			return { ok: false, value: ERR_INVALID_TIMESTAMP };
		if (!["STX", "USD", "BTC"].includes(currency))
			return { ok: false, value: ERR_INVALID_CURRENCY };
		if (interestRate > 20)
			return { ok: false, value: ERR_INVALID_INTEREST_RATE };
		if (gracePeriod > 30) return { ok: false, value: ERR_INVALID_GRACE_PERIOD };
		if (!this.isProposalApproved(proposalId).value)
			return { ok: false, value: ERR_PROPOSAL_NOT_APPROVED };
		if (this.state.treasuryBalance < amount)
			return { ok: false, value: ERR_INSUFFICIENT_FUNDS };
		this.state.treasuryBalance -= amount;
		this.state.projectFunds.set(proposalId, amount);
		this.state.projectStatus.set(proposalId, true);
		this.state.projectRecipients.set(proposalId, recipient);
		this.state.projectExpiry.set(proposalId, expiry);
		this.state.projectCurrencies.set(proposalId, currency);
		this.state.projectInterestRates.set(proposalId, interestRate);
		this.state.projectGracePeriods.set(proposalId, gracePeriod);
		return { ok: true, value: true };
	}

	releaseMilestoneFunds(
		proposalId: number,
		milestone: number,
		amount: number
	): Result<boolean> {
		if (!this.isOracle(this.caller))
			return { ok: false, value: ERR_NOT_AUTHORIZED };
		if (proposalId >= this.state.nextProposalId)
			return { ok: false, value: ERR_INVALID_PROPOSAL_ID };
		if (amount <= 0) return { ok: false, value: ERR_INVALID_AMOUNT };
		if (!this.getMilestoneStatus(proposalId, milestone).value)
			return { ok: false, value: ERR_INVALID_MILESTONE };
		const funds = this.state.projectFunds.get(proposalId) || 0;
		if (funds < amount) return { ok: false, value: ERR_INSUFFICIENT_FUNDS };
		const recipient = this.state.projectRecipients.get(proposalId);
		if (!recipient) return { ok: false, value: ERR_INVALID_PROPOSAL_ID };
		this.stxTransfers.push({ amount, from: "contract", to: recipient });
		this.state.projectFunds.set(proposalId, funds - amount);
		return { ok: true, value: true };
	}

	distributeRoyalties(proposalId: number, amount: number): Result<boolean> {
		if (!this.isAdmin(this.caller))
			return { ok: false, value: ERR_NOT_AUTHORIZED };
		if (proposalId >= this.state.nextProposalId)
			return { ok: false, value: ERR_INVALID_PROPOSAL_ID };
		if (amount <= 0) return { ok: false, value: ERR_INVALID_AMOUNT };
		this.stxTransfers.push({ amount, from: this.caller, to: "contract" });
		this.state.treasuryBalance += amount;
		const current = this.state.projectRoyalties.get(proposalId) || 0;
		this.state.projectRoyalties.set(proposalId, current + amount);
		return { ok: true, value: true };
	}

	withdrawContribution(amount: number): Result<boolean> {
		if (this.state.paused) return { ok: false, value: ERR_TREASURY_PAUSED };
		if (amount <= 0) return { ok: false, value: ERR_INVALID_AMOUNT };
		const current = this.state.contributions.get(this.caller) || 0;
		if (current < amount) return { ok: false, value: ERR_INSUFFICIENT_FUNDS };
		this.stxTransfers.push({ amount, from: "contract", to: this.caller });
		this.state.treasuryBalance -= amount;
		this.state.contributions.set(this.caller, current - amount);
		return { ok: true, value: true };
	}

	pauseTreasury(): Result<boolean> {
		if (!this.isAdmin(this.caller))
			return { ok: false, value: ERR_NOT_AUTHORIZED };
		this.state.paused = true;
		return { ok: true, value: true };
	}

	unpauseTreasury(): Result<boolean> {
		if (!this.isAdmin(this.caller))
			return { ok: false, value: ERR_NOT_AUTHORIZED };
		this.state.paused = false;
		return { ok: true, value: true };
	}

	setRoyaltyRate(newRate: number): Result<boolean> {
		if (!this.isAdmin(this.caller))
			return { ok: false, value: ERR_NOT_AUTHORIZED };
		if (newRate > 50) return { ok: false, value: ERR_INVALID_ROYALTY_RATE };
		this.state.royaltyRate = newRate;
		return { ok: true, value: true };
	}

	setMaxContributions(newMax: number): Result<boolean> {
		if (!this.isAdmin(this.caller))
			return { ok: false, value: ERR_NOT_AUTHORIZED };
		if (newMax <= 0) return { ok: false, value: ERR_INVALID_AMOUNT };
		this.state.maxContributionsPerUser = newMax;
		return { ok: true, value: true };
	}

	enableEmergencyWithdrawal(): Result<boolean> {
		if (!this.isAdmin(this.caller))
			return { ok: false, value: ERR_NOT_AUTHORIZED };
		this.state.emergencyWithdrawalEnabled = true;
		return { ok: true, value: true };
	}

	emergencyWithdraw(amount: number): Result<boolean> {
		if (!this.state.emergencyWithdrawalEnabled)
			return { ok: false, value: ERR_EMERGENCY_WITHDRAWAL_NOT_ALLOWED };
		if (amount <= 0) return { ok: false, value: ERR_INVALID_AMOUNT };
		if (this.state.treasuryBalance < amount)
			return { ok: false, value: ERR_INSUFFICIENT_FUNDS };
		this.stxTransfers.push({ amount, from: "contract", to: this.state.admin });
		this.state.treasuryBalance -= amount;
		return { ok: true, value: true };
	}

	setOracle(newOracle: string): Result<boolean> {
		if (!this.isAdmin(this.caller))
			return { ok: false, value: ERR_NOT_AUTHORIZED };
		this.state.oracle = newOracle;
		return { ok: true, value: true };
	}

	setAdmin(newAdmin: string): Result<boolean> {
		if (!this.isAdmin(this.caller))
			return { ok: false, value: ERR_NOT_AUTHORIZED };
		this.state.admin = newAdmin;
		return { ok: true, value: true };
	}
}

describe("Treasury", () => {
	let contract: TreasuryMock;

	beforeEach(() => {
		contract = new TreasuryMock();
		contract.reset();
	});

	it("contributes successfully", () => {
		const result = contract.contribute(100);
		expect(result.ok).toBe(true);
		expect(contract.state.treasuryBalance).toBe(100);
		expect(contract.state.contributions.get("ST1TEST")).toBe(100);
		expect(contract.state.userContributionCount.get("ST1TEST")).toBe(1);
		expect(contract.stxTransfers).toEqual([
			{ amount: 100, from: "ST1TEST", to: "contract" },
		]);
	});

	it("rejects contribution when paused", () => {
		contract.state.paused = true;
		const result = contract.contribute(100);
		expect(result.ok).toBe(false);
		expect(result.value).toBe(ERR_TREASURY_PAUSED);
	});

	it("rejects invalid contribution amount", () => {
		const result = contract.contribute(0);
		expect(result.ok).toBe(false);
		expect(result.value).toBe(ERR_INVALID_AMOUNT);
	});

	it("rejects max contributions exceeded", () => {
		contract.state.userContributionCount.set("ST1TEST", 10);
		const result = contract.contribute(100);
		expect(result.ok).toBe(false);
		expect(result.value).toBe(ERR_MAX_CONTRIBUTIONS_EXCEEDED);
	});

	it("rejects allocation if not admin", () => {
		const result = contract.allocateFunds(
			0,
			500,
			"ST2RECIP",
			100,
			"STX",
			10,
			7
		);
		expect(result.ok).toBe(false);
		expect(result.value).toBe(ERR_NOT_AUTHORIZED);
	});

	it("rejects invalid proposal id in allocation", () => {
		contract.caller = "ST1ADMIN";
		const result = contract.allocateFunds(
			1,
			500,
			"ST2RECIP",
			100,
			"STX",
			10,
			7
		);
		expect(result.ok).toBe(false);
		expect(result.value).toBe(ERR_INVALID_PROPOSAL_ID);
	});

	it("rejects release if not oracle", () => {
		const result = contract.releaseMilestoneFunds(0, 1, 200);
		expect(result.ok).toBe(false);
		expect(result.value).toBe(ERR_NOT_AUTHORIZED);
	});

	it("rejects royalties if not admin", () => {
		const result = contract.distributeRoyalties(0, 300);
		expect(result.ok).toBe(false);
		expect(result.value).toBe(ERR_NOT_AUTHORIZED);
	});

	it("withdraws contribution successfully", () => {
		contract.state.contributions.set("ST1TEST", 100);
		contract.state.treasuryBalance = 100;
		const result = contract.withdrawContribution(50);
		expect(result.ok).toBe(true);
		expect(contract.state.treasuryBalance).toBe(50);
		expect(contract.state.contributions.get("ST1TEST")).toBe(50);
		expect(contract.stxTransfers).toEqual([
			{ amount: 50, from: "contract", to: "ST1TEST" },
		]);
	});

	it("rejects withdrawal when paused", () => {
		contract.state.paused = true;
		const result = contract.withdrawContribution(50);
		expect(result.ok).toBe(false);
		expect(result.value).toBe(ERR_TREASURY_PAUSED);
	});

	it("pauses treasury successfully", () => {
		contract.caller = "ST1ADMIN";
		const result = contract.pauseTreasury();
		expect(result.ok).toBe(true);
		expect(contract.state.paused).toBe(true);
	});

	it("unpauses treasury successfully", () => {
		contract.caller = "ST1ADMIN";
		contract.state.paused = true;
		const result = contract.unpauseTreasury();
		expect(result.ok).toBe(true);
		expect(contract.state.paused).toBe(false);
	});

	it("sets royalty rate successfully", () => {
		contract.caller = "ST1ADMIN";
		const result = contract.setRoyaltyRate(20);
		expect(result.ok).toBe(true);
		expect(contract.state.royaltyRate).toBe(20);
	});

	it("rejects invalid royalty rate", () => {
		contract.caller = "ST1ADMIN";
		const result = contract.setRoyaltyRate(60);
		expect(result.ok).toBe(false);
		expect(result.value).toBe(ERR_INVALID_ROYALTY_RATE);
	});

	it("sets max contributions successfully", () => {
		contract.caller = "ST1ADMIN";
		const result = contract.setMaxContributions(20);
		expect(result.ok).toBe(true);
		expect(contract.state.maxContributionsPerUser).toBe(20);
	});

	it("enables emergency withdrawal successfully", () => {
		contract.caller = "ST1ADMIN";
		const result = contract.enableEmergencyWithdrawal();
		expect(result.ok).toBe(true);
		expect(contract.state.emergencyWithdrawalEnabled).toBe(true);
	});

	it("performs emergency withdrawal successfully", () => {
		contract.state.emergencyWithdrawalEnabled = true;
		contract.state.treasuryBalance = 1000;
		const result = contract.emergencyWithdraw(500);
		expect(result.ok).toBe(true);
		expect(contract.state.treasuryBalance).toBe(500);
		expect(contract.stxTransfers).toEqual([
			{ amount: 500, from: "contract", to: "ST1ADMIN" },
		]);
	});

	it("rejects emergency withdrawal when not enabled", () => {
		const result = contract.emergencyWithdraw(500);
		expect(result.ok).toBe(false);
		expect(result.value).toBe(ERR_EMERGENCY_WITHDRAWAL_NOT_ALLOWED);
	});

	it("sets oracle successfully", () => {
		contract.caller = "ST1ADMIN";
		const result = contract.setOracle("ST2NEWORACLE");
		expect(result.ok).toBe(true);
		expect(contract.state.oracle).toBe("ST2NEWORACLE");
	});

	it("sets admin successfully", () => {
		contract.caller = "ST1ADMIN";
		const result = contract.setAdmin("ST2NEWADMIN");
		expect(result.ok).toBe(true);
		expect(contract.state.admin).toBe("ST2NEWADMIN");
	});

	it("parses amount with Clarity", () => {
		const cv = uintCV(100);
		expect(cv.value).toEqual(BigInt(100));
	});
});
