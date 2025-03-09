import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CarRentalContract } from "../target/types/car_rental_contract";
import { assert } from "chai";

describe("car_rental_contract", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CarRentalContract as Program<CarRentalContract>;

  it("Adds a new car", async () => {
    const carAccount = anchor.web3.Keypair.generate();

    const tx = await program.methods
      .addCar(new anchor.BN(1), "Tesla Model S", new anchor.BN(100))
      .accounts({
        car: carAccount.publicKey,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([carAccount])
      .rpc();

    console.log("Transaction Signature:", tx);

    const car = await program.account.car.fetch(carAccount.publicKey);
    console.log("Added car: ", car);

    assert.equal(car.id.toNumber(), 1);
    assert.equal(car.name, "Tesla Model S");
    assert.equal(car.pricePerDay.toNumber(), 100);
    assert.isNull(car.renterId);
    assert.equal(car.rentEndDate.toNumber(), 0);
  });

  it("Updates price", async () => {
    const carAccount = anchor.web3.Keypair.generate();

    await program.methods
      .addCar(new anchor.BN(1), "Tesla Model S", new anchor.BN(100))
      .accounts({
        car: carAccount.publicKey,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([carAccount])
      .rpc();

    const tx = await program.methods
      .updatePrice(new anchor.BN(200))
      .accounts({
        car: carAccount.publicKey,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([])
      .rpc();

    console.log("Transaction Signature:", tx);

    const car = await program.account.car.fetch(carAccount.publicKey);
    console.log("Updated car price: ", car.pricePerDay);

    assert.equal(car.id.toNumber(), 1);
    assert.equal(car.name, "Tesla Model S");
    assert.equal(car.pricePerDay.toNumber(), 200);
    assert.isNull(car.renterId);
    assert.equal(car.rentEndDate.toNumber(), 0);
  });

  it("Rent car", async () => {
    const carAccount = anchor.web3.Keypair.generate();

    await program.methods
      .addCar(new anchor.BN(1), "Tesla Model S", new anchor.BN(100))
      .accounts({
        car: carAccount.publicKey,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([carAccount])
      .rpc();

    const renterId = anchor.web3.Keypair.generate().publicKey;
    const daysRent = 3;
    const currentTime = Math.floor(Date.now() / 1000);
    const expectedRentEndDate = currentTime + (daysRent * 86400);

    const tx = await program.methods
      .rentCar(renterId, new anchor.BN(daysRent))
      .accounts({
        car: carAccount.publicKey,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([])
      .rpc();

    console.log("Transaction Signature:", tx);

    const car = await program.account.car.fetch(carAccount.publicKey);
    console.log("Updated car price: ", car.pricePerDay);

    assert.equal(car.id.toNumber(), 1);
    assert.equal(car.name, "Tesla Model S");
    assert.equal(car.pricePerDay.toNumber(), 100);
    assert.equal(car.renterId.toBase58(), renterId.toBase58());
    assert.approximately(car.rentEndDate.toNumber(), expectedRentEndDate, 10);
  });

  it("Return car", async () => {
    const carAccount = anchor.web3.Keypair.generate();

    await program.methods
      .addCar(new anchor.BN(1), "Tesla Model S", new anchor.BN(100))
      .accounts({
        car: carAccount.publicKey,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([carAccount])
      .rpc();

    const tx = await program.methods
      .returnCar()
      .accounts({
        car: carAccount.publicKey,
        owner: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([])
      .rpc();

    console.log("Transaction Signature:", tx);

    const car = await program.account.car.fetch(carAccount.publicKey);
    console.log("Car returned, renterId set to: ", car.renterId);

    assert.equal(car.id.toNumber(), 1);
    assert.equal(car.name, "Tesla Model S");
    assert.equal(car.pricePerDay.toNumber(), 100);
    assert.isNull(car.renterId);
    assert.equal(car.rentEndDate.toNumber(),0);
  });

});
