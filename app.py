from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_PATH = "splitpay.db"

# ══════════════════════════════════════════
#  DATABASE SETUP
# ══════════════════════════════════════════

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Return rows as dicts
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_db()
    c = conn.cursor()

    # Groups table
    c.execute('''
        CREATE TABLE IF NOT EXISTS groups (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            description TEXT    DEFAULT '',
            icon        TEXT    DEFAULT '🎉',
            created_at  TEXT    DEFAULT (datetime('now'))
        )
    ''')

    # Members table
    c.execute('''
        CREATE TABLE IF NOT EXISTS members (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id   INTEGER NOT NULL,
            name       TEXT    NOT NULL,
            email      TEXT    DEFAULT '',
            joined_at  TEXT    DEFAULT (datetime('now')),
            FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
            UNIQUE(group_id, name)
        )
    ''')

    # Expenses table
    c.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id    INTEGER NOT NULL,
            description TEXT    NOT NULL,
            amount      REAL    NOT NULL,
            paid_by     TEXT    NOT NULL,
            category    TEXT    DEFAULT 'Other',
            created_at  TEXT    DEFAULT (datetime('now')),
            FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
        )
    ''')

    # Expense splits table (who owes what for each expense)
    c.execute('''
        CREATE TABLE IF NOT EXISTS expense_splits (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            expense_id  INTEGER NOT NULL,
            member_name TEXT    NOT NULL,
            share       REAL    NOT NULL,
            is_paid     INTEGER DEFAULT 0,
            FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
        )
    ''')

    conn.commit()
    conn.close()
    print("✅ Database initialized.")


# ══════════════════════════════════════════
#  HELPER FUNCTIONS
# ══════════════════════════════════════════

def row_to_dict(row):
    return dict(row) if row else None


def rows_to_list(rows):
    return [dict(r) for r in rows]


def compute_balances(group_id):
    """Compute net balance for each member in a group."""
    conn = get_db()
    c = conn.cursor()

    members = rows_to_list(c.execute(
        "SELECT name FROM members WHERE group_id = ?", (group_id,)
    ).fetchall())

    expenses = rows_to_list(c.execute(
        "SELECT * FROM expenses WHERE group_id = ?", (group_id,)
    ).fetchall())

    conn.close()

    if not members or not expenses:
        return {}

    balances = {m['name']: 0.0 for m in members}
    member_count = len(members)

    for exp in expenses:
        share = exp['amount'] / member_count
        # Payer gets credited full amount
        if exp['paid_by'] in balances:
            balances[exp['paid_by']] += exp['amount']
        # Everyone owes their share
        for m in members:
            balances[m['name']] -= share

    return {k: round(v, 2) for k, v in balances.items()}


def compute_settlements(group_id):
    """Compute minimum transactions to settle all debts."""
    balances = compute_balances(group_id)
    if not balances:
        return []

    debtors  = sorted([(n, -b) for n, b in balances.items() if b < -0.01], key=lambda x: -x[1])
    creditors = sorted([(n, b)  for n, b in balances.items() if b >  0.01], key=lambda x: -x[1])

    transactions = []
    i, j = 0, 0

    while i < len(debtors) and j < len(creditors):
        debtor_name,   debt   = debtors[i]
        creditor_name, credit = creditors[j]
        payment = round(min(debt, credit), 2)

        transactions.append({
            'from':   debtor_name,
            'to':     creditor_name,
            'amount': payment
        })

        debtors[i]   = (debtor_name,   round(debt   - payment, 2))
        creditors[j] = (creditor_name, round(credit - payment, 2))

        if debtors[i][1]   < 0.01: i += 1
        if creditors[j][1] < 0.01: j += 1

    return transactions


def get_group_summary(group_id):
    """Return full group data with stats."""
    conn = get_db()
    c = conn.cursor()

    group = row_to_dict(c.execute(
        "SELECT * FROM groups WHERE id = ?", (group_id,)
    ).fetchone())

    if not group:
        conn.close()
        return None

    members = rows_to_list(c.execute(
        "SELECT * FROM members WHERE group_id = ?", (group_id,)
    ).fetchall())

    expenses = rows_to_list(c.execute(
        "SELECT * FROM expenses WHERE group_id = ? ORDER BY created_at DESC",
        (group_id,)
    ).fetchall())

    conn.close()

    total_amount = sum(e['amount'] for e in expenses)

    group['members']      = members
    group['expenses']     = expenses
    group['member_count'] = len(members)
    group['expense_count']= len(expenses)
    group['total_amount'] = round(total_amount, 2)
    group['balances']     = compute_balances(group_id)
    group['settlements']  = compute_settlements(group_id)

    return group


# ══════════════════════════════════════════
#  ROUTES — GROUPS
# ══════════════════════════════════════════

@app.route('/groups', methods=['GET'])
def get_groups():
    """Get all groups with their stats."""
    conn = get_db()
    c = conn.cursor()
    groups = rows_to_list(c.execute("SELECT * FROM groups ORDER BY created_at DESC").fetchall())
    conn.close()

    # Attach stats to each group
    result = []
    for g in groups:
        summary = get_group_summary(g['id'])
        if summary:
            result.append(summary)

    return jsonify(result), 200


@app.route('/groups', methods=['POST'])
def create_group():
    """Create a new group."""
    data = request.json

    if not data or not data.get('name', '').strip():
        return jsonify({'error': 'Group name is required'}), 400

    conn = get_db()
    c = conn.cursor()
    c.execute(
        "INSERT INTO groups (name, description, icon) VALUES (?, ?, ?)",
        (
            data['name'].strip(),
            data.get('description', '').strip(),
            data.get('icon', '🎉')
        )
    )
    group_id = c.lastrowid
    conn.commit()
    conn.close()

    return jsonify(get_group_summary(group_id)), 201


@app.route('/groups/<int:group_id>', methods=['GET'])
def get_group(group_id):
    """Get a single group with full details."""
    summary = get_group_summary(group_id)
    if not summary:
        return jsonify({'error': 'Group not found'}), 404
    return jsonify(summary), 200


@app.route('/groups/<int:group_id>', methods=['PUT'])
def update_group(group_id):
    """Update group name/description/icon."""
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    conn = get_db()
    c = conn.cursor()

    group = c.execute("SELECT * FROM groups WHERE id = ?", (group_id,)).fetchone()
    if not group:
        conn.close()
        return jsonify({'error': 'Group not found'}), 404

    c.execute('''
        UPDATE groups
        SET name        = ?,
            description = ?,
            icon        = ?
        WHERE id = ?
    ''', (
        data.get('name',        group['name']),
        data.get('description', group['description']),
        data.get('icon',        group['icon']),
        group_id
    ))
    conn.commit()
    conn.close()

    return jsonify(get_group_summary(group_id)), 200


@app.route('/groups/<int:group_id>', methods=['DELETE'])
def delete_group(group_id):
    """Delete a group and all its data."""
    conn = get_db()
    c = conn.cursor()

    group = c.execute("SELECT * FROM groups WHERE id = ?", (group_id,)).fetchone()
    if not group:
        conn.close()
        return jsonify({'error': 'Group not found'}), 404

    c.execute("DELETE FROM groups WHERE id = ?", (group_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': f'Group "{group["name"]}" deleted successfully'}), 200


# ══════════════════════════════════════════
#  ROUTES — MEMBERS
# ══════════════════════════════════════════

@app.route('/groups/<int:group_id>/members', methods=['GET'])
def get_members(group_id):
    """Get all members of a group."""
    conn = get_db()
    c = conn.cursor()

    if not c.execute("SELECT id FROM groups WHERE id = ?", (group_id,)).fetchone():
        conn.close()
        return jsonify({'error': 'Group not found'}), 404

    members = rows_to_list(c.execute(
        "SELECT * FROM members WHERE group_id = ?", (group_id,)
    ).fetchall())
    conn.close()

    return jsonify(members), 200


@app.route('/groups/<int:group_id>/members', methods=['POST'])
def add_member(group_id):
    """Add a member to a group."""
    data = request.json

    if not data or not data.get('name', '').strip():
        return jsonify({'error': 'Member name is required'}), 400

    conn = get_db()
    c = conn.cursor()

    if not c.execute("SELECT id FROM groups WHERE id = ?", (group_id,)).fetchone():
        conn.close()
        return jsonify({'error': 'Group not found'}), 404

    # Check duplicate
    existing = c.execute(
        "SELECT id FROM members WHERE group_id = ? AND name = ?",
        (group_id, data['name'].strip())
    ).fetchone()

    if existing:
        conn.close()
        return jsonify({'error': f'Member "{data["name"]}" already exists in this group'}), 409

    c.execute(
        "INSERT INTO members (group_id, name, email) VALUES (?, ?, ?)",
        (group_id, data['name'].strip(), data.get('email', '').strip())
    )
    member_id = c.lastrowid
    conn.commit()

    member = row_to_dict(c.execute(
        "SELECT * FROM members WHERE id = ?", (member_id,)
    ).fetchone())
    conn.close()

    return jsonify(member), 201


@app.route('/groups/<int:group_id>/members/<int:member_id>', methods=['DELETE'])
def remove_member(group_id, member_id):
    """Remove a member from a group."""
    conn = get_db()
    c = conn.cursor()

    member = c.execute(
        "SELECT * FROM members WHERE id = ? AND group_id = ?", (member_id, group_id)
    ).fetchone()

    if not member:
        conn.close()
        return jsonify({'error': 'Member not found'}), 404

    c.execute("DELETE FROM members WHERE id = ?", (member_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': f'Member "{member["name"]}" removed'}), 200


# ══════════════════════════════════════════
#  ROUTES — EXPENSES
# ══════════════════════════════════════════

@app.route('/groups/<int:group_id>/expenses', methods=['GET'])
def get_expenses(group_id):
    """Get all expenses for a group."""
    conn = get_db()
    c = conn.cursor()

    if not c.execute("SELECT id FROM groups WHERE id = ?", (group_id,)).fetchone():
        conn.close()
        return jsonify({'error': 'Group not found'}), 404

    expenses = rows_to_list(c.execute(
        "SELECT * FROM expenses WHERE group_id = ? ORDER BY created_at DESC",
        (group_id,)
    ).fetchall())
    conn.close()

    return jsonify(expenses), 200


@app.route('/groups/<int:group_id>/expenses', methods=['POST'])
def add_expense(group_id):
    """Add an expense to a group."""
    data = request.json

    if not data:
        return jsonify({'error': 'No data provided'}), 400
    if not data.get('description', '').strip():
        return jsonify({'error': 'Description is required'}), 400
    if not data.get('amount') or float(data['amount']) <= 0:
        return jsonify({'error': 'Valid amount is required'}), 400
    if not data.get('paid_by', '').strip():
        return jsonify({'error': 'paid_by is required'}), 400

    conn = get_db()
    c = conn.cursor()

    if not c.execute("SELECT id FROM groups WHERE id = ?", (group_id,)).fetchone():
        conn.close()
        return jsonify({'error': 'Group not found'}), 404

    # Check paid_by is a member
    member = c.execute(
        "SELECT id FROM members WHERE group_id = ? AND name = ?",
        (group_id, data['paid_by'].strip())
    ).fetchone()

    if not member:
        conn.close()
        return jsonify({'error': f'"{data["paid_by"]}" is not a member of this group'}), 400

    c.execute('''
        INSERT INTO expenses (group_id, description, amount, paid_by, category)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        group_id,
        data['description'].strip(),
        round(float(data['amount']), 2),
        data['paid_by'].strip(),
        data.get('category', 'Other').strip()
    ))
    expense_id = c.lastrowid

    # Auto-create equal splits for all members
    members = rows_to_list(c.execute(
        "SELECT name FROM members WHERE group_id = ?", (group_id,)
    ).fetchall())

    if members:
        share = round(float(data['amount']) / len(members), 2)
        for m in members:
            c.execute(
                "INSERT INTO expense_splits (expense_id, member_name, share) VALUES (?, ?, ?)",
                (expense_id, m['name'], share)
            )

    conn.commit()

    expense = row_to_dict(c.execute(
        "SELECT * FROM expenses WHERE id = ?", (expense_id,)
    ).fetchone())
    conn.close()

    return jsonify(expense), 201


@app.route('/groups/<int:group_id>/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(group_id, expense_id):
    """Delete an expense."""
    conn = get_db()
    c = conn.cursor()

    expense = c.execute(
        "SELECT * FROM expenses WHERE id = ? AND group_id = ?", (expense_id, group_id)
    ).fetchone()

    if not expense:
        conn.close()
        return jsonify({'error': 'Expense not found'}), 404

    c.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
    conn.commit()
    conn.close()

    return jsonify({'message': f'Expense "{expense["description"]}" deleted'}), 200


# ══════════════════════════════════════════
#  ROUTES — BALANCES & SETTLEMENTS
# ══════════════════════════════════════════

@app.route('/groups/<int:group_id>/balances', methods=['GET'])
def get_balances(group_id):
    """Get net balance for each member."""
    conn = get_db()
    c = conn.cursor()
    if not c.execute("SELECT id FROM groups WHERE id = ?", (group_id,)).fetchone():
        conn.close()
        return jsonify({'error': 'Group not found'}), 404
    conn.close()

    balances = compute_balances(group_id)
    return jsonify({
        'group_id': group_id,
        'balances': balances,
        'settlements': compute_settlements(group_id)
    }), 200


@app.route('/groups/<int:group_id>/settle', methods=['POST'])
def settle_up(group_id):
    """Mark a settlement as paid (record a repayment expense)."""
    data = request.json

    if not data or not data.get('from') or not data.get('to') or not data.get('amount'):
        return jsonify({'error': 'from, to, and amount are required'}), 400

    conn = get_db()
    c = conn.cursor()

    if not c.execute("SELECT id FROM groups WHERE id = ?", (group_id,)).fetchone():
        conn.close()
        return jsonify({'error': 'Group not found'}), 404

    # Record settlement as a special expense
    c.execute('''
        INSERT INTO expenses (group_id, description, amount, paid_by, category)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        group_id,
        f"Settlement: {data['from']} → {data['to']}",
        round(float(data['amount']), 2),
        data['from'],
        '✅ Settlement'
    ))
    conn.commit()
    conn.close()

    return jsonify({
        'message': f"Settlement recorded: {data['from']} paid {data['to']} ₹{data['amount']}",
        'balances': compute_balances(group_id),
        'settlements': compute_settlements(group_id)
    }), 200


# ══════════════════════════════════════════
#  ROUTES — SUMMARY / STATS
# ══════════════════════════════════════════

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get overall app statistics."""
    conn = get_db()
    c = conn.cursor()

    total_groups   = c.execute("SELECT COUNT(*) FROM groups").fetchone()[0]
    total_members  = c.execute("SELECT COUNT(DISTINCT name) FROM members").fetchone()[0]
    total_expenses = c.execute("SELECT COUNT(*) FROM expenses").fetchone()[0]
    total_amount   = c.execute("SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE category != '✅ Settlement'").fetchone()[0]

    # Category breakdown
    categories = rows_to_list(c.execute('''
        SELECT category, COUNT(*) as count, SUM(amount) as total
        FROM expenses
        WHERE category != '✅ Settlement'
        GROUP BY category
        ORDER BY total DESC
    ''').fetchall())

    # Most active group
    top_group = row_to_dict(c.execute('''
        SELECT g.name, COUNT(e.id) as expense_count, COALESCE(SUM(e.amount), 0) as total
        FROM groups g
        LEFT JOIN expenses e ON g.id = e.group_id
        GROUP BY g.id
        ORDER BY total DESC
        LIMIT 1
    ''').fetchone())

    conn.close()

    return jsonify({
        'total_groups':   total_groups,
        'total_members':  total_members,
        'total_expenses': total_expenses,
        'total_amount':   round(total_amount, 2),
        'categories':     categories,
        'top_group':      top_group
    }), 200


# ══════════════════════════════════════════
#  ERROR HANDLERS
# ══════════════════════════════════════════

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Route not found'}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({'error': 'Method not allowed'}), 405

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error', 'details': str(e)}), 500


# ══════════════════════════════════════════
#  START
# ══════════════════════════════════════════

if __name__ == '__main__':
    init_db()
    print("🚀 SplitPay backend running on http://127.0.0.1:5000")
    print("\n📋 API Endpoints:")
    print("  GET    /stats")
    print("  GET    /groups")
    print("  POST   /groups")
    print("  GET    /groups/<id>")
    print("  PUT    /groups/<id>")
    print("  DELETE /groups/<id>")
    print("  GET    /groups/<id>/members")
    print("  POST   /groups/<id>/members")
    print("  DELETE /groups/<id>/members/<member_id>")
    print("  GET    /groups/<id>/expenses")
    print("  POST   /groups/<id>/expenses")
    print("  DELETE /groups/<id>/expenses/<expense_id>")
    print("  GET    /groups/<id>/balances")
    print("  POST   /groups/<id>/settle")
    app.run(debug=True, port=5000)
