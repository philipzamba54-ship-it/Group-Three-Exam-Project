// controllers/groupController.js
const db = require('../config/db');

// Get all groups (with member count)
exports.getAllGroups = async (req, res) => {
    try {
        const [groups] = await db.query(`
            SELECT g.*, COUNT(gm.id) as member_count,
                   u.name as leader_name
            FROM StudyGroup g
            LEFT JOIN GroupMember gm ON g.id = gm.group_id
            LEFT JOIN User u ON g.leader_id = u.id
            GROUP BY g.id
        `);
        res.json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new group (only logged-in users)
exports.createGroup = async (req, res) => {
    const { group_name, course_name, description, meeting_location } = req.body;
    const leader_id = req.user.id; // from auth middleware
    
    try {
        const [result] = await db.query(
            'INSERT INTO StudyGroup (group_name, course_name, description, meeting_location, leader_id) VALUES (?, ?, ?, ?, ?)',
            [group_name, course_name, description, meeting_location, leader_id]
        );
        
        // Automatically add leader as member
        await db.query('INSERT INTO GroupMember (user_id, group_id) VALUES (?, ?)', [leader_id, result.insertId]);
        
        res.status(201).json({ id: result.insertId, message: 'Group created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Join a group
exports.joinGroup = async (req, res) => {
    const groupId = req.params.id;
    const userId = req.user.id;
    
    try {
        // Check if already member
        const [existing] = await db.query('SELECT * FROM GroupMember WHERE user_id = ? AND group_id = ?', [userId, groupId]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Already a member' });
        }
        
        await db.query('INSERT INTO GroupMember (user_id, group_id) VALUES (?, ?)', [userId, groupId]);
        res.json({ message: 'Joined group successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get groups the logged-in user belongs to
exports.myGroups = async (req, res) => {
    const userId = req.user.id;
    try {
        const [groups] = await db.query(`
            SELECT g.* FROM StudyGroup g
            JOIN GroupMember gm ON g.id = gm.group_id
            WHERE gm.user_id = ?
        `, [userId]);
        res.json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
//group members leaving the group
 exports.leaveGroup =async (req, res) => {
    const { groupId } =req.params;
    const userid = req.user.Id;
    await db.query ('DELETE FROM Groupmember WHRE user_id =? AND group_id =?',[user_Id,groupId]);
    res.json({ message: 'you have left the group'});
    };
