import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CarRentalContract } from "../target/types/car_rental_contract";
import { assert } from "chai";

describe("car_rental_contract", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CarRentalContract as Program<CarRentalContract>;

  it("Adds a car", async () => {
    const carAccount = anchor.web3.Keypair.generate();
    const tx = await program.methods
      .addCar(new anchor.BN(1), "Tesla Model S", new anchor.BN(100))
      .accounts({
        car: carAccount,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([carAccount])
      .rpc();

    console.log("Transaction Signature (Initialize):", tx);

    const car = await program.account.car.fetch(carAccount.publicKey);
    console.log("Added car: ", car);

    assert.equal(car.id.toNumber(), 1);
    assert.equal(car.name, "Tesla Model S");
    assert.equal(car.pricePerDay.toNumber(), 100);
    assert.isNull(car.renterId);
    assert.equal(car.rentEndDate.toNumber(), 0);
  });
});
