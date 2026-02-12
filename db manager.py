# """
# Database Management Utility for SplitPay

# This script provides utilities for managing the SplitPay database.
# """

# import sys
# import os
# from datetime import datetime
# import json

# # Add parent directory to path to import app
# sys.path.insert(0, os.path.dirname(__file__))

# from app import app, db, User, Group, GroupMember, Expense, ExpenseSplit, Payment, SplitHistory

# def init_db():
#     """Initialize the database"""
#     print("Initializing database...")
#     with app.app_context():
#         db.create_all()
#         print("✅ Database initialized successfully!")

# def reset_db():
#     """Reset the database (WARNING: Deletes all data)"""
#     response = input("⚠️  WARNING: This will delete ALL data. Continue? (yes/no): ")
#     if response.lower() != 'yes':
#         print("Operation cancelled.")
#         return
    
#     print("Resetting database...")
#     with app.app_context():
#         db.drop_all()
#         db.create_all()
#         print("✅ Database reset successfully!")

# def seed_db():
#     """Seed the database with sample data"""
#     print("Seeding database with sample data...")
    
#     with app.app_context():
#         # Create users
#         users = [
#             User(name="Alice Johnson", email="alice@example.com", phone="+1234567890"),
#             User(name="Bob Smith", email="bob@example.com", phone="+1234567891"),
#             User(name="Charlie Brown", email="charlie@example.com", phone="+1234567892"),
#             User(name="Diana Prince", email="diana@example.com", phone="+1234567893")
#         ]
        
#         for user in users:
#             db.session.add(user)
#         db.session.commit()
#         print(f"✅ Created {len(users)} users")
        
#         # Create groups
#         group1 = Group(
#             name="Roommates",
#             description="Apartment 4B",
#             creator_id=users[0].id
#         )
#         group2 = Group(
#             name="Weekend Trip",
#             description="Beach vacation",
#             creator_id=users[1].id
#         )
        
#         db.session.add(group1)
#         db.session.add(group2)
#         db.session.commit()
#         print(f"✅ Created 2 groups")
        
#         # Add group members
#         members = [
#             GroupMember(group_id=group1.id, user_id=users[0].id, is_admin=True),
#             GroupMember(group_id=group1.id, user_id=users[1].id),
#             GroupMember(group_id=group1.id, user_id=users[2].id),
#             GroupMember(group_id=group2.id, user_id=users[1].id, is_admin=True),
#             GroupMember(group_id=group2.id, user_id=users[2].id),
#             GroupMember(group_id=group2.id, user_id=users[3].id),
#         ]
        
#         for member in members:
#             db.session.add(member)
#         db.session.commit()
#         print(f"✅ Added {len(members)} group members")
        
#         # Create expenses
#         expense1 = Expense(
#             group_id=group1.id,
#             creator_id=users[0].id,
#             description="Grocery Shopping",
#             amount=1200,
#             tip=0,
#             tax=0,
#             total_amount=1200,
#             split_type="equal"
#         )
        
#         expense2 = Expense(
#             group_id=group2.id,
#             creator_id=users[1].id,
#             description="Beach House Rental",
#             amount=6000,
#             tip=0,
#             tax=300,
#             total_amount=6300,
#             split_type="equal"
#         )
        
#         db.session.add(expense1)
#         db.session.add(expense2)
#         db.session.commit()
#         print(f"✅ Created 2 expenses")
        
#         # Create expense splits
#         splits = [
#             # Expense 1 splits (3 people)
#             ExpenseSplit(expense_id=expense1.id, user_id=users[0].id, amount=400),
#             ExpenseSplit(expense_id=expense1.id, user_id=users[1].id, amount=400),
#             ExpenseSplit(expense_id=expense1.id, user_id=users[2].id, amount=400),
#             # Expense 2 splits (3 people)
#             ExpenseSplit(expense_id=expense2.id, user_id=users[1].id, amount=2100),
#             ExpenseSplit(expense_id=expense2.id, user_id=users[2].id, amount=2100),
#             ExpenseSplit(expense_id=expense2.id, user_id=users[3].id, amount=2100),
#         ]
        
#         for split in splits:
#             db.session.add(split)
#         db.session.commit()
#         print(f"✅ Created {len(splits)} expense splits")
        
#         # Create a sample payment
#         payment = Payment(
#             payer_id=users[1].id,
#             payee_id=users[0].id,
#             amount=400,
#             payment_method="upi",
#             transaction_id="TXN20240101ABC123",
#             status="completed",
#             notes="Payment for grocery share",
#             completed_at=datetime.utcnow()
#         )
        
#         db.session.add(payment)
#         db.session.commit()
#         print(f"✅ Created 1 payment")
        
#         # Create split history
#         history = SplitHistory(
#             user_id=users[0].id,
#             amount=1200,
#             tip=0,
#             tax=0,
#             total_amount=1200,
#             per_person=400,
#             friend_count=3,
#             split_data=json.dumps({
#                 "friends": ["Alice", "Bob", "Charlie"],
#                 "timestamp": datetime.utcnow().isoformat()
#             })
#         )
        
#         db.session.add(history)
#         db.session.commit()
#         print(f"✅ Created 1 split history entry")
        
#         print("\n✅ Database seeded successfully!")

# def show_stats():
#     """Show database statistics"""
#     print("\n" + "="*60)
#     print("  DATABASE STATISTICS")
#     print("="*60 + "\n")
    
#     with app.app_context():
#         user_count = User.query.count()
#         group_count = Group.query.count()
#         expense_count = Expense.query.count()
#         payment_count = Payment.query.count()
#         total_amount = db.session.query(db.func.sum(Expense.total_amount)).scalar() or 0
        
#         print(f"👥 Total Users:      {user_count}")
#         print(f"👨‍👩‍👧‍👦 Total Groups:     {group_count}")
#         print(f"💰 Total Expenses:   {expense_count}")
#         print(f"💳 Total Payments:   {payment_count}")
#         print(f"💵 Total Amount:     ₹{total_amount:.2f}")
#         print()

# def list_users():
#     """List all users"""
#     print("\n" + "="*60)
#     print("  ALL USERS")
#     print("="*60 + "\n")
    
#     with app.app_context():
#         users = User.query.all()
        
#         if not users:
#             print("No users found.")
#             return
        
#         for user in users:
#             print(f"ID:    {user.id}")
#             print(f"Name:  {user.name}")
#             print(f"Email: {user.email}")
#             print(f"Phone: {user.phone}")
#             print("-" * 60)

# def list_groups():
#     """List all groups"""
#     print("\n" + "="*60)
#     print("  ALL GROUPS")
#     print("="*60 + "\n")
    
#     with app.app_context():
#         groups = Group.query.all()
        
#         if not groups:
#             print("No groups found.")
#             return
        
#         for group in groups:
#             print(f"ID:          {group.id}")
#             print(f"Name:        {group.name}")
#             print(f"Description: {group.description}")
#             print(f"Creator:     {group.creator.name if group.creator else 'N/A'}")
#             print(f"Members:     {len(group.members)}")
#             print("-" * 60)

# def list_expenses():
#     """List all expenses"""
#     print("\n" + "="*60)
#     print("  ALL EXPENSES")
#     print("="*60 + "\n")
    
#     with app.app_context():
#         expenses = Expense.query.all()
        
#         if not expenses:
#             print("No expenses found.")
#             return
        
#         for expense in expenses:
#             print(f"ID:          {expense.id}")
#             print(f"Description: {expense.description}")
#             print(f"Amount:      ₹{expense.total_amount:.2f}")
#             print(f"Creator:     {expense.creator.name if expense.creator else 'N/A'}")
#             print(f"Splits:      {len(expense.splits)}")
#             print(f"Settled:     {'Yes' if expense.is_settled else 'No'}")
#             print("-" * 60)

# def backup_db():
#     """Create a backup of the database"""
#     import shutil
    
#     db_path = "splitpay.db"
#     if not os.path.exists(db_path):
#         print("❌ Database file not found!")
#         return
    
#     timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#     backup_path = f"splitpay_backup_{timestamp}.db"
    
#     shutil.copy2(db_path, backup_path)
#     print(f"✅ Database backed up to: {backup_path}")

# def print_menu():
#     """Print menu options"""
#     print("\n" + "="*60)
#     print("  SPLITPAY DATABASE MANAGER")
#     print("="*60)
#     print("\n1. Initialize Database")
#     print("2. Reset Database (⚠️  Deletes all data)")
#     print("3. Seed Database (Add sample data)")
#     print("4. Show Statistics")
#     print("5. List Users")
#     print("6. List Groups")
#     print("7. List Expenses")
#     print("8. Backup Database")
#     print("9. Exit")
#     print("\n" + "="*60)

# def main():
#     """Main function"""
#     while True:
#         print_menu()
#         choice = input("\nEnter your choice (1-9): ").strip()
        
#         if choice == '1':
#             init_db()
#         elif choice == '2':
#             reset_db()
#         elif choice == '3':
#             seed_db()
#         elif choice == '4':
#             show_stats()
#         elif choice == '5':
#             list_users()
#         elif choice == '6':
#             list_groups()
#         elif choice == '7':
#             list_expenses()
#         elif choice == '8':
#             backup_db()
#         elif choice == '9':
#             print("\nGoodbye! 👋")
#             break
#         else:
#             print("\n❌ Invalid choice. Please try again.")

# if __name__ == "__main__":
#     main()