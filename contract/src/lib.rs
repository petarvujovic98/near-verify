// Find all our documentation at https://docs.near.org
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::store::{UnorderedMap, UnorderedSet};
use near_sdk::{assert_one_yocto, env, near_bindgen, require, AccountId};

#[derive(BorshDeserialize, BorshSerialize)]
struct Entry {
    id: String,
    count: u32,
    sum: u32,
    account_ids: UnorderedSet<AccountId>,
    pinned: Option<bool>,
}

// Define the contract structure
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Contract {
    entries: UnorderedMap<String, Entry>,
    authorities: UnorderedSet<AccountId>,
}

impl Default for Contract {
    fn default() -> Self {
        Self {
            entries: UnorderedMap::new(b"e"),
            authorities: UnorderedSet::new(b"a"),
        }
    }
}

// Implement the contract structure
#[near_bindgen]
impl Contract {
    #[init]
    #[private]
    pub fn new(authorities: Vec<AccountId>) -> Self {
        Self {
            entries: UnorderedMap::new(b"e"),
            authorities: {
                let mut auths = UnorderedSet::new(b"a");
                auths.extend(authorities.into_iter());

                auths
            },
        }
    }

    #[payable]
    pub fn submit_verification(&mut self, entry_id: String, trusted: bool) {
        assert_one_yocto();

        self.entries
            .entry(entry_id.clone())
            .and_modify(|entry| {
                if entry.pinned.is_none() && !entry.account_ids.contains(&env::signer_account_id())
                {
                    entry.count += 1;
                    entry.sum += if trusted { 1 } else { 0 };
                    entry.account_ids.insert(env::signer_account_id());
                }
            })
            .or_insert(Entry {
                pinned: None,
                count: 1,
                sum: if trusted { 1 } else { 0 },
                account_ids: {
                    let mut set = UnorderedSet::new(format!("t-{entry_id}").as_bytes());
                    set.insert(env::signer_account_id());
                    set
                },
                id: entry_id,
            });
    }

    #[payable]
    pub fn pin_verification(&mut self, entry_id: String, trusted: bool) {
        require!(
            self.authorities.contains(&env::signer_account_id()),
            "You are not authorized to perform this action"
        );
        assert_one_yocto();

        self.entries
            .entry(entry_id.clone())
            .and_modify(|entry| {
                entry.pinned = Some(trusted);
            })
            .or_insert(Entry {
                count: 0,
                sum: 0,
                pinned: Some(trusted),
                account_ids: UnorderedSet::new(format!("t-{entry_id}").as_bytes()),
                id: entry_id,
            });
    }

    pub fn get_verification(&self, entry_id: String) -> Option<f64> {
        match self.entries.get(&entry_id) {
            Some(entry) => {
                if let Some(trusted) = entry.pinned {
                    Some(if trusted { 1_f64 } else { 0_f64 })
                } else {
                    Some(entry.sum as f64 / entry.count as f64)
                }
            }
            None => None,
        }
    }

    #[payable]
    pub fn add_authorities(&mut self, authorities: Vec<AccountId>) {
        require!(
            self.authorities.contains(&env::signer_account_id()),
            "You are not authorized to perform this action"
        );
        assert_one_yocto();

        self.authorities.extend(authorities.into_iter());
    }
}
