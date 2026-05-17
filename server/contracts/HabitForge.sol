// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HabitForge {
    struct User {
        uint256 id;
        string name;
        string email;
        uint256 xp;
        uint256 level;
        string[] badges;
        bool isPremium;
        uint256 createdAt;
    }

    struct Habit {
        uint256 id;
        uint256 userId;
        string name;
        string frequency;
        string color;
        string icon;
        uint256 streak;
        uint256 lastCompleted;
        uint256 refreshInterval;
        uint256 createdAt;
    }

    struct HabitLog {
        uint256 id;
        uint256 habitId;
        uint256 userId;
        uint256 completedAt;
    }

    mapping(uint256 => User) private users;
    mapping(uint256 => Habit) private habits;
    mapping(uint256 => HabitLog) private habitLogs;
    mapping(string => uint256) private emailToUserId;

    uint256 private userCounter = 0;
    uint256 private habitCounter = 0;
    uint256 private logCounter = 0;

    // ─── Users ──────────────────────────────────────────────────────────────

    function createUser(string memory _name, string memory _email) public returns (uint256) {
        require(emailToUserId[_email] == 0, "Email already exists");
        userCounter++;
        string[] memory emptyBadges = new string[](0);
        users[userCounter] = User({
            id: userCounter,
            name: _name,
            email: _email,
            xp: 0,
            level: 1,
            badges: emptyBadges,
            isPremium: false,
            createdAt: block.timestamp
        });
        emailToUserId[_email] = userCounter;
        return userCounter;
    }

    function getUser(uint256 _id) public view returns (User memory) {
        require(_id > 0 && _id <= userCounter, "User not found");
        return users[_id];
    }

    function getUserByEmail(string memory _email) public view returns (User memory) {
        uint256 id = emailToUserId[_email];
        require(id > 0, "User not found");
        return users[id];
    }

    function updateUser(uint256 _id, string memory _name, string memory _email) public {
        require(_id > 0 && _id <= userCounter, "User not found");
        User storage user = users[_id];
        if (keccak256(abi.encodePacked(user.email)) != keccak256(abi.encodePacked(_email))) {
            require(emailToUserId[_email] == 0, "Email already exists");
            emailToUserId[user.email] = 0;
            emailToUserId[_email] = _id;
            user.email = _email;
        }
        user.name = _name;
    }

    function upgradeUser(uint256 _id) public {
        require(_id > 0 && _id <= userCounter, "User not found");
        users[_id].isPremium = true;
    }

    function updateUserStats(uint256 _id, uint256 _xp, uint256 _level, string[] memory _badges) public {
        require(_id > 0 && _id <= userCounter, "User not found");
        User storage user = users[_id];
        user.xp = _xp;
        user.level = _level;
        user.badges = _badges;
    }

    // ─── Habits ─────────────────────────────────────────────────────────────

    function createHabit(
        uint256 _userId,
        string memory _name,
        string memory _frequency,
        string memory _color,
        string memory _icon,
        uint256 _refreshInterval
    ) public returns (uint256) {
        require(_userId > 0 && _userId <= userCounter, "User not found");
        habitCounter++;
        habits[habitCounter] = Habit({
            id: habitCounter,
            userId: _userId,
            name: _name,
            frequency: _frequency,
            color: _color,
            icon: _icon,
            streak: 0,
            lastCompleted: 0,
            refreshInterval: _refreshInterval,
            createdAt: block.timestamp
        });
        return habitCounter;
    }

    function getHabit(uint256 _id) public view returns (Habit memory) {
        require(_id > 0 && _id <= habitCounter, "Habit not found");
        return habits[_id];
    }

    function getHabitsByUserId(uint256 _userId) public view returns (Habit[] memory) {
        require(_userId > 0 && _userId <= userCounter, "User not found");
        uint256 count = 0;
        for (uint256 i = 1; i <= habitCounter; i++) {
            if (habits[i].userId == _userId) count++;
        }
        Habit[] memory result = new Habit[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= habitCounter; i++) {
            if (habits[i].userId == _userId) result[idx++] = habits[i];
        }
        return result;
    }

    function updateHabit(
        uint256 _id,
        string memory _name,
        string memory _frequency,
        string memory _color,
        string memory _icon
    ) public {
        require(_id > 0 && _id <= habitCounter, "Habit not found");
        Habit storage h = habits[_id];
        h.name = _name;
        h.frequency = _frequency;
        h.color = _color;
        h.icon = _icon;
    }

    function deleteHabit(uint256 _id) public {
        require(_id > 0 && _id <= habitCounter, "Habit not found");
        habits[_id].userId = 0;
    }

    function updateHabitStreak(uint256 _id, uint256 _streak, uint256 _lastCompleted) public {
        require(_id > 0 && _id <= habitCounter, "Habit not found");
        habits[_id].streak = _streak;
        habits[_id].lastCompleted = _lastCompleted;
    }

    // ─── Logs ────────────────────────────────────────────────────────────────

    function logCompletion(uint256 _habitId, uint256 _userId, uint256 _completedAt, uint256 _newStreak) public returns (uint256) {
        require(_habitId > 0 && _habitId <= habitCounter, "Habit not found");
        require(_userId > 0 && _userId <= userCounter, "User not found");
        logCounter++;
        habitLogs[logCounter] = HabitLog({ id: logCounter, habitId: _habitId, userId: _userId, completedAt: _completedAt });
        habits[_habitId].streak = _newStreak;
        habits[_habitId].lastCompleted = _completedAt;
        return logCounter;
    }

    function getLogsByUserId(uint256 _userId) public view returns (HabitLog[] memory) {
        require(_userId > 0 && _userId <= userCounter, "User not found");
        uint256 count = 0;
        for (uint256 i = 1; i <= logCounter; i++) {
            if (habitLogs[i].userId == _userId) count++;
        }
        HabitLog[] memory result = new HabitLog[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= logCounter; i++) {
            if (habitLogs[i].userId == _userId) result[idx++] = habitLogs[i];
        }
        return result;
    }

    function getLogsCountByUserId(uint256 _userId) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i <= logCounter; i++) {
            if (habitLogs[i].userId == _userId) count++;
        }
        return count;
    }

    // ─── Batch Seed (single transaction for entire demo history) ────────────

    function batchSeedHistory(
        uint256 _userId,
        uint256[] calldata _habitIds,
        uint256[] calldata _completedAtList,
        uint256[] calldata _finalStreaks,
        uint256[] calldata _lastCompletedList,
        uint256 _totalXp,
        uint256 _newLevel
    ) public {
        require(_userId > 0 && _userId <= userCounter, "User not found");
        uint256 numHabits = _habitIds.length;
        uint256 daysCount = numHabits > 0 ? _completedAtList.length / numHabits : 0;

        for (uint256 h = 0; h < numHabits; h++) {
            uint256 habitId = _habitIds[h];
            uint256 baseIdx = h * daysCount;
            for (uint256 d = 0; d < daysCount; d++) {
                if (_completedAtList[baseIdx + d] > 0) {
                    logCounter++;
                    habitLogs[logCounter].id = logCounter;
                    habitLogs[logCounter].habitId = habitId;
                    habitLogs[logCounter].userId = _userId;
                    habitLogs[logCounter].completedAt = _completedAtList[baseIdx + d];
                }
            }
            habits[habitId].streak = _finalStreaks[h];
            habits[habitId].lastCompleted = _lastCompletedList[h];
        }

        users[_userId].xp = _totalXp;
        users[_userId].level = _newLevel;
    }
}
