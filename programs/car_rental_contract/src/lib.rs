use anchor_lang::prelude::*;

declare_id!("CNyntcsPwvN4pJbnzc1dFBGQ2aycY2aTDZNJw8LR4Lk6");

#[program]
pub mod car_rental_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
