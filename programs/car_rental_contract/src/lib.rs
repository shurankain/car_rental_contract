use anchor_lang::prelude::*;

declare_id!("CNyntcsPwvN4pJbnzc1dFBGQ2aycY2aTDZNJw8LR4Lk6");

#[program]
pub mod car_rental_contract {
    use super::*;

    pub fn add_car(ctx: Context<AddCar>, id: u64, name: String, price_per_day: u64) -> Result<()> {
        let car = &mut ctx.accounts.car;
        car.id = id;
        car.name = name;
        car.price_per_day = price_per_day;
        car.renter_id = None;
        car.rent_end_date = 0;
        Ok(())
    }

    pub fn update_price(ctx: Context<UpdatePrice>, new_price: u64) -> Result<()> {
        let car = &mut ctx.accounts.car;
        car.price_per_day = new_price;
        Ok(())
    }

    pub fn rent_car(ctx: Context<RentCar>, renter_id: Pubkey, days: u64) -> Result<()> {
        let car = &mut ctx.accounts.car;
        require!(car.renter_id.is_none(), ErrorCode::AlreadyRented);
        let current_time = Clock::get()?.unix_timestamp;
        car.renter_id = Some(renter_id);
        car.rent_end_date = current_time + (days as i64) * 86400;
        Ok(())
    }

    pub fn return_car(ctx: Context<ReturnCar>) -> Result<()> {
        let car = &mut ctx.accounts.car;
        let current_time = Clock::get()?.unix_timestamp;
        require!(
            car.rent_end_date <= current_time,
            ErrorCode::RentalNotExpired
        );
        car.renter_id = None;
        car.rent_end_date = 0;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct AddCar<'info> {
    #[account(init, payer = owner, space = 8 + 64)]
    pub car: Account<'info, Car>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePrice<'info> {
    #[account(mut)]
    pub car: Account<'info, Car>,
}

#[derive(Accounts)]
pub struct RentCar<'info> {
    #[account(mut)]
    pub car: Account<'info, Car>,
}

#[derive(Accounts)]
pub struct ReturnCar<'info> {
    #[account(mut)]
    pub car: Account<'info, Car>,
}

#[account]
pub struct Car {
    pub id: u64,
    pub name: String,
    pub price_per_day: u64,
    pub renter_id: Option<Pubkey>,
    pub rent_end_date: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("This car is already rented.")]
    AlreadyRented,
    #[msg("Car rental period has not yet expired.")]
    RentalNotExpired,
}
