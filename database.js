const fs = require('fs');
const path = require('path');
const authUtils = require('./auth-utils');

const DB_PATH_SQLITE = path.join(__dirname, 'database.sqlite');
const DB_PATH_JSON = path.join(__dirname, 'database.json');

let dbDriver = null;

// Try initializing Node native SQLite first
try {
  const { DatabaseSync } = require('node:sqlite');
  const sqliteDb = new DatabaseSync(DB_PATH_SQLITE);

  sqliteDb.exec('PRAGMA foreign_keys = ON;');
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'guardian', -- 'guardian', 'tutor', 'admin'
      password_hash TEXT,
      salt TEXT,
      auth_provider TEXT DEFAULT 'local',
      google_id TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login_at DATETIME
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);

    -- Tutor Profiles
    CREATE TABLE IF NOT EXISTS tutor_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      institution TEXT NOT NULL,
      department TEXT,
      subjects TEXT,
      preferred_locations TEXT,
      monthly_rate TEXT,
      rating REAL DEFAULT 4.9,
      reviews_count INTEGER DEFAULT 18,
      is_available INTEGER DEFAULT 1,
      is_verified INTEGER DEFAULT 1,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_tutor_profiles_user ON tutor_profiles(user_id);

    -- Tuition Applications
    CREATE TABLE IF NOT EXISTS tuition_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_code TEXT UNIQUE NOT NULL,
      guardian_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      guardian_name TEXT NOT NULL,
      guardian_phone TEXT NOT NULL,
      guardian_email TEXT,
      target_tutor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      student_class TEXT NOT NULL,
      medium TEXT NOT NULL,
      subjects TEXT NOT NULL,
      location TEXT NOT NULL,
      salary_budget TEXT,
      days_per_week INTEGER DEFAULT 3,
      gender_preference TEXT DEFAULT 'Any',
      special_notes TEXT,
      routing_type TEXT NOT NULL, -- 'direct_to_tutor', 'broadcast_admin'
      status TEXT DEFAULT 'submitted', -- 'submitted', 'routed', 'accepted', 'declined', 'in_review', 'completed'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_tuition_app_code ON tuition_applications(app_code);
    CREATE INDEX IF NOT EXISTS idx_tuition_app_guardian ON tuition_applications(guardian_id);
    CREATE INDEX IF NOT EXISTS idx_tuition_app_tutor ON tuition_applications(target_tutor_id);
    CREATE INDEX IF NOT EXISTS idx_tuition_app_status ON tuition_applications(status);

    -- Application Routes & Assignment Ledger
    CREATE TABLE IF NOT EXISTS application_routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL REFERENCES tuition_applications(id) ON DELETE CASCADE,
      assigned_to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      assigned_role TEXT NOT NULL, -- 'tutor', 'admin'
      assigned_by TEXT DEFAULT 'system_auto', -- 'system_auto', 'admin_override'
      status TEXT DEFAULT 'pending', -- 'pending', 'viewed', 'accepted', 'declined'
      response_notes TEXT,
      routed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      responded_at DATETIME
    );

    CREATE INDEX IF NOT EXISTS idx_app_routes_app ON application_routes(application_id);
    CREATE INDEX IF NOT EXISTS idx_app_routes_user ON application_routes(assigned_to_user_id);
    CREATE INDEX IF NOT EXISTS idx_app_routes_status ON application_routes(status);

    -- Notifications Ledger
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      application_id INTEGER REFERENCES tuition_applications(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

    -- Student Profiles (extends users role='student')
    CREATE TABLE IF NOT EXISTS student_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      guardian_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      academic_level TEXT NOT NULL,
      institution_name TEXT,
      current_curriculum TEXT,
      learning_goals TEXT,
      preferred_tutor_gender TEXT DEFAULT 'any',
      address_location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_student_user ON student_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_student_guardian ON student_profiles(guardian_id);

    -- Guardian Profiles (extends users role='guardian')
    CREATE TABLE IF NOT EXISTS guardian_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      occupation TEXT,
      emergency_contact TEXT,
      relationship_to_student TEXT,
      residential_address TEXT,
      city_zone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_guardian_user ON guardian_profiles(user_id);

    -- Booking Requests System (Core Matchmaking)
    CREATE TABLE IF NOT EXISTS booking_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_code TEXT UNIQUE NOT NULL,
      requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      requester_role TEXT NOT NULL, -- 'student', 'guardian'
      tutor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      student_grade_level TEXT NOT NULL,
      subjects TEXT NOT NULL,
      tuition_medium TEXT NOT NULL,
      location_zone TEXT NOT NULL,
      budget_offered TEXT NOT NULL,
      days_per_week INTEGER DEFAULT 3,
      preferred_schedule TEXT,
      special_requirements TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'completed', 'cancelled'
      rejection_reason TEXT,
      accepted_at DATETIME,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_booking_req_code ON booking_requests(request_code);
    CREATE INDEX IF NOT EXISTS idx_booking_tutor ON booking_requests(tutor_id, status);
    CREATE INDEX IF NOT EXISTS idx_booking_requester ON booking_requests(requester_id, status);

    -- Booking Status History (Audit Trail)
    CREATE TABLE IF NOT EXISTS booking_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
      previous_status TEXT,
      new_status TEXT NOT NULL,
      changed_by_user_id INTEGER NOT NULL REFERENCES users(id),
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Reviews & Ratings
    CREATE TABLE IF NOT EXISTS reviews_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER UNIQUE REFERENCES booking_requests(id) ON DELETE SET NULL,
      tutor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      review_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Schema migrations
  try { sqliteDb.exec('ALTER TABLE users ADD COLUMN last_login_at DATETIME;'); } catch (e) { }
  try { sqliteDb.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';"); } catch (e) { }
  try { sqliteDb.exec('ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 1;'); } catch (e) { }
  try { sqliteDb.exec('ALTER TABLE users ADD COLUMN is_phone_verified INTEGER DEFAULT 1;'); } catch (e) { }

  dbDriver = {
    type: 'sqlite',
    db: sqliteDb,

    // ========================================================================
    // User & Session Methods
    // ========================================================================
    createUser({ name, email, phone = '', role = 'guardian', password_hash = null, salt = null, auth_provider = 'local', google_id = null, avatar_url = null }) {
      const stmt = sqliteDb.prepare(`
        INSERT INTO users (name, email, phone, role, password_hash, salt, auth_provider, google_id, avatar_url, last_login_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      stmt.run(name, email.toLowerCase().trim(), phone || '', role, password_hash, salt, auth_provider, google_id, avatar_url || null);
      return this.getUserByEmail(email);
    },

    getUserByEmail(email) {
      if (!email) return null;
      const stmt = sqliteDb.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE LIMIT 1');
      return stmt.get(email.toLowerCase().trim()) || null;
    },

    getUserByEmailOrPhone(identifier) {
      if (!identifier) return null;
      const clean = identifier.trim();
      const cleanDigits = clean.replace(/[^0-9]/g, '');
      const stmt = sqliteDb.prepare(`
        SELECT * FROM users 
        WHERE email = ? COLLATE NOCASE 
           OR (phone != '' AND phone = ?)
           OR (? != '' AND replace(replace(phone, ' ', ''), '-', '') = ?)
        LIMIT 1
      `);
      return stmt.get(clean.toLowerCase(), clean, cleanDigits, cleanDigits) || null;
    },

    getUserById(id) {
      if (!id) return null;
      const stmt = sqliteDb.prepare('SELECT id, name, email, phone, role, auth_provider, avatar_url, created_at, last_login_at FROM users WHERE id = ? LIMIT 1');
      return stmt.get(Number(id)) || null;
    },

    getUsersByRole(role) {
      const stmt = sqliteDb.prepare('SELECT id, name, email, phone, role, avatar_url, created_at FROM users WHERE role = ? ORDER BY id ASC');
      return stmt.all(role);
    },

    updateLastLogin(id) {
      if (!id) return null;
      const stmt = sqliteDb.prepare(`
        UPDATE users 
        SET last_login_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(Number(id));
      return this.getUserById(id);
    },

    getAllUsers() {
      const stmt = sqliteDb.prepare(`
        SELECT id, name, email, phone, role, auth_provider, avatar_url, created_at, last_login_at 
        FROM users 
        ORDER BY id DESC
      `);
      return stmt.all();
    },

    updateUser(id, { name, phone, role, avatar_url, password_hash, salt }) {
      const stmt = sqliteDb.prepare(`
        UPDATE users 
        SET name = COALESCE(?, name),
            phone = COALESCE(?, phone),
            role = COALESCE(?, role),
            avatar_url = COALESCE(?, avatar_url),
            password_hash = COALESCE(?, password_hash),
            salt = COALESCE(?, salt),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(name || null, phone || null, role || null, avatar_url || null, password_hash || null, salt || null, Number(id));
      return this.getUserById(id);
    },

    createSession(userId, token, ttlMs = 7 * 24 * 60 * 60 * 1000) {
      this.cleanExpiredSessions();
      const expiresAt = Date.now() + ttlMs;
      const stmt = sqliteDb.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)');
      stmt.run(token, Number(userId), expiresAt);
      return { token, userId, expiresAt };
    },

    getSessionUser(token) {
      if (!token) return null;
      const now = Date.now();
      const stmt = sqliteDb.prepare(`
        SELECT u.id, u.name, u.email, u.phone, u.role, u.auth_provider, u.avatar_url, u.created_at, u.last_login_at, s.expires_at
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ? AND s.expires_at > ?
        LIMIT 1
      `);
      return stmt.get(token, now) || null;
    },

    deleteSession(token) {
      if (!token) return;
      const stmt = sqliteDb.prepare('DELETE FROM sessions WHERE token = ?');
      stmt.run(token);
    },

    cleanExpiredSessions() {
      const now = Date.now();
      const stmt = sqliteDb.prepare('DELETE FROM sessions WHERE expires_at <= ?');
      stmt.run(now);
    },

    // ========================================================================
    // Tutor Profile Methods
    // ========================================================================
    createOrUpdateTutorProfile({ userId, institution, department, subjects, preferred_locations, monthly_rate, rating, bio, is_available, is_verified }) {
      const existing = this.getTutorProfileByUserId(userId);
      const updatedInst = institution !== undefined ? institution : (existing ? existing.institution : '');
      const updatedDept = department !== undefined ? department : (existing ? existing.department : '');
      const updatedSubj = subjects !== undefined ? subjects : (existing ? existing.subjects : '');
      const updatedLoc = preferred_locations !== undefined ? preferred_locations : (existing ? existing.preferred_locations : '');
      const updatedRate = monthly_rate !== undefined ? monthly_rate : (existing ? existing.monthly_rate : '');
      const updatedRating = rating !== undefined ? rating : (existing ? existing.rating : 4.9);
      const updatedBio = bio !== undefined ? bio : (existing ? existing.bio : '');
      const updatedAvail = is_available !== undefined ? (is_available ? 1 : 0) : (existing ? existing.is_available : 1);
      const updatedVerif = is_verified !== undefined ? (is_verified ? 1 : 0) : (existing ? existing.is_verified : 1);

      if (existing) {
        const stmt = sqliteDb.prepare(`
          UPDATE tutor_profiles
          SET institution = ?, department = ?, subjects = ?, preferred_locations = ?,
              monthly_rate = ?, rating = ?, bio = ?, is_available = ?, is_verified = ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `);
        stmt.run(updatedInst, updatedDept, updatedSubj, updatedLoc, updatedRate, updatedRating, updatedBio, updatedAvail, updatedVerif, Number(userId));
      } else {
        const stmt = sqliteDb.prepare(`
          INSERT INTO tutor_profiles (user_id, institution, department, subjects, preferred_locations, monthly_rate, rating, bio, is_available, is_verified)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(Number(userId), updatedInst, updatedDept, updatedSubj, updatedLoc, updatedRate, updatedRating, updatedBio, updatedAvail, updatedVerif);
      }
      return this.getTutorProfileByUserId(userId);
    },

    getTutorProfileByUserId(userId) {
      if (!userId) return null;
      const stmt = sqliteDb.prepare(`
        SELECT tp.*, u.name, u.email, u.phone, u.avatar_url
        FROM tutor_profiles tp
        JOIN users u ON tp.user_id = u.id
        WHERE tp.user_id = ?
        LIMIT 1
      `);
      return stmt.get(Number(userId)) || null;
    },

    getAllTutorsWithProfiles() {
      const stmt = sqliteDb.prepare(`
        SELECT u.id, u.name, u.email, u.phone, u.avatar_url,
               tp.institution, tp.department, tp.subjects, tp.preferred_locations,
               tp.monthly_rate, tp.rating, tp.reviews_count, tp.is_available, tp.is_verified, tp.bio
        FROM users u
        LEFT JOIN tutor_profiles tp ON u.id = tp.user_id
        WHERE u.role = 'tutor'
        ORDER BY tp.rating DESC, u.id ASC
      `);
      return stmt.all();
    },

    // ========================================================================
    // Tuition Applications & Routing Methods
    // ========================================================================
    createApplication({ guardian_id = null, guardian_name, guardian_phone, guardian_email = '', target_tutor_id = null, student_class, medium, subjects, location, salary_budget = '', days_per_week = 3, gender_preference = 'Any', special_notes = '', routing_type = 'broadcast_admin', status = 'submitted' }) {
      const appCode = `APP-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      const stmt = sqliteDb.prepare(`
        INSERT INTO tuition_applications (
          app_code, guardian_id, guardian_name, guardian_phone, guardian_email,
          target_tutor_id, student_class, medium, subjects, location,
          salary_budget, days_per_week, gender_preference, special_notes,
          routing_type, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        appCode,
        guardian_id ? Number(guardian_id) : null,
        guardian_name.trim(),
        guardian_phone.trim(),
        guardian_email ? guardian_email.trim().toLowerCase() : '',
        target_tutor_id ? Number(target_tutor_id) : null,
        student_class.trim(),
        medium.trim(),
        subjects.trim(),
        location.trim(),
        salary_budget ? salary_budget.trim() : '',
        Number(days_per_week) || 3,
        gender_preference || 'Any',
        special_notes ? special_notes.trim() : '',
        routing_type,
        status
      );

      return this.getApplicationByCode(appCode);
    },

    getApplicationById(id) {
      if (!id) return null;
      const stmt = sqliteDb.prepare(`
        SELECT ta.*,
               tu.name as target_tutor_name, tu.email as target_tutor_email, tu.phone as target_tutor_phone,
               gu.name as registered_guardian_name
        FROM tuition_applications ta
        LEFT JOIN users tu ON ta.target_tutor_id = tu.id
        LEFT JOIN users gu ON ta.guardian_id = gu.id
        WHERE ta.id = ?
        LIMIT 1
      `);
      const row = stmt.get(Number(id));
      return this._normalizeApp(row);
    },

    getApplicationByCode(appCode) {
      if (!appCode) return null;
      const stmt = sqliteDb.prepare(`
        SELECT ta.*,
               tu.name as target_tutor_name, tu.email as target_tutor_email,
               gu.name as registered_guardian_name
        FROM tuition_applications ta
        LEFT JOIN users tu ON ta.target_tutor_id = tu.id
        LEFT JOIN users gu ON ta.guardian_id = gu.id
        WHERE ta.app_code = ?
        LIMIT 1
      `);
      const row = stmt.get(appCode.trim());
      return this._normalizeApp(row);
    },

    _normalizeApp(row) {
      if (!row) return null;
      return {
        ...row,
        application_code: row.application_code || row.app_code,
        app_code: row.app_code || row.application_code,
        budget: row.budget || row.salary_budget || '',
        salary_budget: row.salary_budget || row.budget || '',
        is_direct_request: (row.routing_type === 'direct_to_tutor' || row.is_direct_request === 1) ? 1 : 0
      };
    },

    updateApplicationStatus(id, status) {
      const stmt = sqliteDb.prepare(`
        UPDATE tuition_applications
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(status, Number(id));
      return this.getApplicationById(id);
    },

    createApplicationRoute({ applicationId, assignedToUserId, assignedRole = 'tutor', assignedBy = 'system_auto', status = 'pending', responseNotes = null }) {
      const stmt = sqliteDb.prepare(`
        INSERT INTO application_routes (application_id, assigned_to_user_id, assigned_role, assigned_by, status, response_notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(Number(applicationId), Number(assignedToUserId), assignedRole, assignedBy, status, responseNotes || null);

      return this.getRoutesForApplication(applicationId);
    },

    getRoutesForApplication(applicationId) {
      const stmt = sqliteDb.prepare(`
        SELECT ar.*, u.name as assigned_user_name, u.email as assigned_user_email, u.role as assigned_user_role
        FROM application_routes ar
        JOIN users u ON ar.assigned_to_user_id = u.id
        WHERE ar.application_id = ?
        ORDER BY ar.id DESC
      `);
      return stmt.all(Number(applicationId));
    },

    getRouteById(routeId) {
      const stmt = sqliteDb.prepare(`
        SELECT ar.*, ta.app_code, ta.student_class, ta.subjects, ta.location, ta.salary_budget, ta.guardian_name, ta.guardian_phone
        FROM application_routes ar
        JOIN tuition_applications ta ON ar.application_id = ta.id
        WHERE ar.id = ?
        LIMIT 1
      `);
      return stmt.get(Number(routeId)) || null;
    },

    updateRouteStatus({ routeId, tutorUserId, status, responseNotes = '' }) {
      const stmt = sqliteDb.prepare(`
        UPDATE application_routes
        SET status = ?, response_notes = ?, responded_at = CURRENT_TIMESTAMP
        WHERE id = ? AND (assigned_to_user_id = ? OR EXISTS (SELECT 1 FROM users WHERE id = ? AND role = 'admin'))
      `);
      stmt.run(status, responseNotes || '', Number(routeId), Number(tutorUserId), Number(tutorUserId));

      const route = this.getRouteById(routeId);
      if (route) {
        // Also update application status
        this.updateApplicationStatus(route.application_id, status);
      }
      return route;
    },

    getApplicationsForTutor(tutorUserId) {
      const stmt = sqliteDb.prepare(`
        SELECT ta.*, ar.id as route_id, ar.status as route_status, ar.routed_at, ar.responded_at, ar.response_notes,
               ar.assigned_by
        FROM tuition_applications ta
        JOIN application_routes ar ON ta.id = ar.application_id
        WHERE ar.assigned_to_user_id = ?
        ORDER BY ar.routed_at DESC
      `);
      const rows = stmt.all(Number(tutorUserId));
      return rows.map(r => this._normalizeApp(r));
    },

    getAllApplicationsForAdmin({ status = null, routingType = null, limit = 100, offset = 0 } = {}) {
      let query = `
        SELECT ta.*,
               tu.name as target_tutor_name,
               ar.id as active_route_id, ar.status as active_route_status, ar.assigned_to_user_id,
               au.name as assigned_tutor_name, au.phone as assigned_tutor_phone
        FROM tuition_applications ta
        LEFT JOIN users tu ON ta.target_tutor_id = tu.id
        LEFT JOIN application_routes ar ON ta.id = ar.application_id
        LEFT JOIN users au ON ar.assigned_to_user_id = au.id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        query += ' AND ta.status = ?';
        params.push(status);
      }
      if (routingType) {
        query += ' AND ta.routing_type = ?';
        params.push(routingType);
      }

      query += ' ORDER BY ta.created_at DESC LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));

      const stmt = sqliteDb.prepare(query);
      const rows = stmt.all(...params);
      return rows.map(r => this._normalizeApp(r));
    },

    // ========================================================================
    // Notifications Methods
    // ========================================================================
    createNotification({ userId, applicationId = null, type, title, message }) {
      const stmt = sqliteDb.prepare(`
        INSERT INTO notifications (user_id, application_id, type, title, message)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(Number(userId), applicationId ? Number(applicationId) : null, type, title, message);

      const getStmt = sqliteDb.prepare('SELECT * FROM notifications WHERE id = last_insert_rowid()');
      return getStmt.get();
    },

    getNotificationsForUser(userId, { unreadOnly = false, limit = 50 } = {}) {
      let query = `SELECT * FROM notifications WHERE user_id = ?`;
      const params = [Number(userId)];

      if (unreadOnly) {
        query += ` AND is_read = 0`;
      }

      query += ` ORDER BY created_at DESC LIMIT ?`;
      params.push(Number(limit));

      const stmt = sqliteDb.prepare(query);
      return stmt.all(...params);
    },

    markNotificationsRead(userId, notificationIds = null) {
      if (Array.isArray(notificationIds) && notificationIds.length > 0) {
        const placeholders = notificationIds.map(() => '?').join(',');
        const stmt = sqliteDb.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id IN (${placeholders})`);
        stmt.run(Number(userId), ...notificationIds.map(Number));
      } else {
        const stmt = sqliteDb.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`);
        stmt.run(Number(userId));
      }
      return this.getUnreadNotificationCount(userId);
    },

    getUnreadNotificationCount(userId) {
      const stmt = sqliteDb.prepare('SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = 0');
      const res = stmt.get(Number(userId));
      return res ? res.unread_count : 0;
    },

    // ========================================================================
    // Booking Requests & Role Profile Methods
    // ========================================================================
    createBookingRequest({
      requesterId,
      requesterRole = 'guardian',
      tutorId,
      studentGradeLevel,
      subjects,
      tuitionMedium,
      locationZone,
      budgetOffered,
      daysPerWeek = 3,
      preferredSchedule = '',
      specialRequirements = ''
    }) {
      const requestCode = 'REQ-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
      const stmt = sqliteDb.prepare(`
        INSERT INTO booking_requests (
          request_code, requester_id, requester_role, tutor_id,
          student_grade_level, subjects, tuition_medium, location_zone,
          budget_offered, days_per_week, preferred_schedule, special_requirements, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `);

      stmt.run(
        requestCode,
        Number(requesterId),
        requesterRole,
        Number(tutorId),
        studentGradeLevel || 'General',
        subjects || 'All Subjects',
        tuitionMedium || 'Bangla Medium',
        locationZone || 'Dhaka',
        budgetOffered || 'Negotiable',
        Number(daysPerWeek) || 3,
        preferredSchedule || '',
        specialRequirements || ''
      );

      const getStmt = sqliteDb.prepare('SELECT * FROM booking_requests WHERE id = last_insert_rowid()');
      const created = getStmt.get();

      // Log initial status in history
      if (created) {
        try {
          const histStmt = sqliteDb.prepare(`
            INSERT INTO booking_status_history (booking_id, previous_status, new_status, changed_by_user_id, remarks)
            VALUES (?, NULL, 'pending', ?, 'Initial booking request submitted')
          `);
          histStmt.run(created.id, Number(requesterId));
        } catch (e) { }

        // Also create notification for tutor
        try {
          this.createNotification({
            userId: Number(tutorId),
            type: 'booking_request_received',
            title: 'New Booking Request Received',
            message: `A student/guardian has requested tutoring for ${subjects} (${studentGradeLevel}) in ${locationZone}.`
          });
        } catch (e) { }
      }

      return created;
    },

    getBookingRequestById(id) {
      const stmt = sqliteDb.prepare(`
        SELECT br.*,
               req.name as requester_name, req.email as requester_email, req.phone as requester_phone,
               tut.name as tutor_name, tut.email as tutor_email, tut.phone as tutor_phone,
               tp.institution as tutor_institution
        FROM booking_requests br
        JOIN users req ON br.requester_id = req.id
        JOIN users tut ON br.tutor_id = tut.id
        LEFT JOIN tutor_profiles tp ON tut.id = tp.user_id
        WHERE br.id = ?
        LIMIT 1
      `);
      return stmt.get(Number(id)) || null;
    },

    getBookingRequestsForTutor(tutorId, status = null) {
      let query = `
        SELECT br.*,
               req.name as requester_name, req.email as requester_email, req.phone as requester_phone
        FROM booking_requests br
        JOIN users req ON br.requester_id = req.id
        WHERE br.tutor_id = ?
      `;
      const params = [Number(tutorId)];

      if (status && status !== 'all') {
        query += ` AND br.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY br.id DESC`;
      const stmt = sqliteDb.prepare(query);
      return stmt.all(...params);
    },

    getBookingRequestsForRequester(requesterId, status = null) {
      let query = `
        SELECT br.*,
               tut.name as tutor_name, tut.email as tutor_email, tut.phone as tutor_phone,
               tp.institution as tutor_institution, tp.monthly_rate as tutor_monthly_rate
        FROM booking_requests br
        JOIN users tut ON br.tutor_id = tut.id
        LEFT JOIN tutor_profiles tp ON tut.id = tp.user_id
        WHERE br.requester_id = ?
      `;
      const params = [Number(requesterId)];

      if (status && status !== 'all') {
        query += ` AND br.status = ?`;
        params.push(status);
      }

      query += ` ORDER BY br.id DESC`;
      const stmt = sqliteDb.prepare(query);
      return stmt.all(...params);
    },

    updateBookingRequestStatus({ bookingId, changedByUserId, status, rejectionReason = '', remarks = '' }) {
      const current = this.getBookingRequestById(bookingId);
      if (!current) return null;

      const stmt = sqliteDb.prepare(`
        UPDATE booking_requests
        SET status = ?,
            rejection_reason = ?,
            accepted_at = CASE WHEN ? = 'accepted' THEN CURRENT_TIMESTAMP ELSE accepted_at END,
            completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      stmt.run(status, rejectionReason || null, status, status, Number(bookingId));

      // Log status transition in history
      try {
        const histStmt = sqliteDb.prepare(`
          INSERT INTO booking_status_history (booking_id, previous_status, new_status, changed_by_user_id, remarks)
          VALUES (?, ?, ?, ?, ?)
        `);
        histStmt.run(Number(bookingId), current.status, status, Number(changedByUserId), remarks || rejectionReason || '');
      } catch (e) { }

      // Notify requester
      try {
        this.createNotification({
          userId: current.requester_id,
          type: 'booking_status_updated',
          title: `Booking Request ${status.toUpperCase()}`,
          message: `Your booking request (${current.request_code}) with tutor ${current.tutor_name} has been ${status}.`
        });
      } catch (e) { }

      return this.getBookingRequestById(bookingId);
    },

    getAllBookingRequests(filterStatus = null) {
      let query = `
        SELECT br.*,
               req.name as requester_name, req.email as requester_email, req.phone as requester_phone,
               tut.name as tutor_name, tut.email as tutor_email, tut.phone as tutor_phone
        FROM booking_requests br
        JOIN users req ON br.requester_id = req.id
        JOIN users tut ON br.tutor_id = tut.id
      `;
      const params = [];

      if (filterStatus && filterStatus !== 'all') {
        query += ` WHERE br.status = ?`;
        params.push(filterStatus);
      }

      query += ` ORDER BY br.id DESC`;
      const stmt = sqliteDb.prepare(query);
      return stmt.all(...params);
    },

    getAllUsersWithProfiles() {
      const stmt = sqliteDb.prepare(`
        SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.created_at, u.last_login_at,
               tp.institution as tutor_institution, tp.is_verified as tutor_verified,
               sp.academic_level as student_grade,
               gp.occupation as guardian_occupation
        FROM users u
        LEFT JOIN tutor_profiles tp ON u.id = tp.user_id
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        LEFT JOIN guardian_profiles gp ON u.id = gp.user_id
        ORDER BY u.id DESC
      `);
      return stmt.all();
    },

    updateUserStatus(userId, status) {
      const stmt = sqliteDb.prepare(`
        UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `);
      stmt.run(status, Number(userId));
      return this.getUserById(userId);
    },

    getPlatformOverviewStats() {
      const totalUsers = sqliteDb.prepare('SELECT COUNT(*) as count FROM users').get().count;
      const totalTutors = sqliteDb.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'tutor'").get().count;
      const totalStudents = sqliteDb.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get().count;
      const totalGuardians = sqliteDb.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'guardian'").get().count;
      const totalBookings = sqliteDb.prepare('SELECT COUNT(*) as count FROM booking_requests').get().count;
      const pendingBookings = sqliteDb.prepare("SELECT COUNT(*) as count FROM booking_requests WHERE status = 'pending'").get().count;
      const acceptedBookings = sqliteDb.prepare("SELECT COUNT(*) as count FROM booking_requests WHERE status = 'accepted'").get().count;
      const rejectedBookings = sqliteDb.prepare("SELECT COUNT(*) as count FROM booking_requests WHERE status = 'rejected'").get().count;

      const totalPipelineValue = sqliteDb.prepare('SELECT SUM(budget_offered) as total FROM booking_requests').get().total || 0;
      const acceptedPipelineValue = sqliteDb.prepare("SELECT SUM(budget_offered) as total FROM booking_requests WHERE status = 'accepted'").get().total || 0;
      const verifiedTutors = sqliteDb.prepare("SELECT COUNT(*) as count FROM tutor_profiles WHERE is_verified = 1").get().count;

      return {
        totalUsers,
        totalTutors,
        totalStudents,
        totalGuardians,
        totalBookings,
        pendingBookings,
        acceptedBookings,
        rejectedBookings,
        totalPipelineValue: Math.round(totalPipelineValue),
        acceptedPipelineValue: Math.round(acceptedPipelineValue),
        verifiedTutors,
        successRate: totalBookings > 0 ? Math.round((acceptedBookings / totalBookings) * 100) : 100
      };
    },

    getRecentPlatformActivity(limit = 20) {
      try {
        const events = [];

        // 1. Recent user registrations
        const recentUsers = sqliteDb.prepare(`
          SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT ?
        `).all(limit);
        recentUsers.forEach(u => {
          events.push({
            type: 'user_registered',
            title: `New ${u.role ? u.role.toUpperCase() : 'USER'} Registered`,
            description: `${u.name} (${u.email}) joined the platform`,
            timestamp: u.created_at,
            category: 'user',
            badgeColor: u.role === 'admin' ? 'red' : u.role === 'tutor' ? 'purple' : 'blue'
          });
        });

        // 2. Recent booking requests
        const recentBookings = sqliteDb.prepare(`
          SELECT b.request_code, b.subjects, b.student_grade_level, b.budget_offered, b.status, b.created_at,
                 u.name as requester_name, t.name as tutor_name
          FROM booking_requests b
          LEFT JOIN users u ON b.requester_id = u.id
          LEFT JOIN users t ON b.tutor_id = t.id
          ORDER BY b.created_at DESC LIMIT ?
        `).all(limit);
        recentBookings.forEach(b => {
          events.push({
            type: 'booking_created',
            title: `Booking Request ${b.request_code}`,
            description: `${b.requester_name || 'Requester'} requested ${b.subjects} for ${b.student_grade_level} with tutor ${b.tutor_name || 'Assigned'} (৳${b.budget_offered})`,
            timestamp: b.created_at,
            category: 'booking',
            badgeColor: 'amber'
          });
        });

        // 3. Recent status history
        const recentHistory = sqliteDb.prepare(`
          SELECT h.previous_status, h.new_status, h.remarks, h.created_at,
                 b.request_code, u.name as changed_by
          FROM booking_status_history h
          LEFT JOIN booking_requests b ON h.booking_id = b.id
          LEFT JOIN users u ON h.changed_by_user_id = u.id
          ORDER BY h.created_at DESC LIMIT ?
        `).all(limit);
        recentHistory.forEach(h => {
          events.push({
            type: 'status_changed',
            title: `Booking Status: ${h.new_status.toUpperCase()}`,
            description: `Request ${h.request_code || ''} updated to ${h.new_status} by ${h.changed_by || 'User'} (${h.remarks || 'No remarks'})`,
            timestamp: h.created_at,
            category: 'status',
            badgeColor: h.new_status === 'accepted' ? 'emerald' : h.new_status === 'rejected' ? 'red' : 'blue'
          });
        });

        // Sort all events by timestamp descending and slice to limit
        events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return events.slice(0, limit);
      } catch (err) {
        console.error('Error fetching platform activity:', err);
        return [];
      }
    },

    // ========================================================================
    // Default Seeding: Admin, Tutors & Sample Data
    // ========================================================================
    seedDefaultRolesAndData() {
      // 1. Seed Admin
      let admin = this.getUserByEmail('admin@combinetution.com');
      if (!admin) {
        const { hash, salt } = authUtils.hashPassword('AdminPassword123!');
        admin = this.createUser({
          name: 'Academic Coordinator Admin',
          email: 'admin@combinetution.com',
          phone: '01711032847',
          role: 'admin',
          password_hash: hash,
          salt: salt,
          auth_provider: 'local'
        });
        console.log('Seeded default Admin: admin@combinetution.com / AdminPassword123!');
      }

      // 2. Seed Verified Tutors
      const defaultTutors = [
        {
          name: 'Tanvir Hasan',
          email: 'tanvir@combinetution.com',
          phone: '01711223344',
          institution: 'BUET (Computer Science & Engineering)',
          department: 'CSE',
          subjects: 'Higher Math, Physics, ICT',
          preferred_locations: 'Dhanmondi, Lalmatia, Mohammadpur',
          monthly_rate: '৳ 8,000 / month',
          rating: 4.95,
          bio: 'Passionate educator with 4+ years tutoring experience. Specialized in calculus, mechanics, and making complex math intuitive.'
        },
        {
          name: 'Nusrat Jahan',
          email: 'nusrat@combinetution.com',
          phone: '01811223355',
          institution: 'Dhaka Medical College (MBBS)',
          department: 'Medical Studies',
          subjects: 'Biology, Chemistry',
          preferred_locations: 'Gulshan, Banani, Baridhara',
          monthly_rate: '৳ 10,000 / month',
          rating: 4.92,
          bio: 'Top medical scholar focusing on concept clearance for Botany, Zoology, and Organic Chemistry with comprehensive chapter-wise notes.'
        },
        {
          name: 'Abrar Chowdhury',
          email: 'abrar@combinetution.com',
          phone: '01911223366',
          institution: 'IBA, University of Dhaka',
          department: 'Business Administration',
          subjects: 'English, Accounting, Business Studies',
          preferred_locations: 'Uttara, Bashundhara R/A',
          monthly_rate: '৳ 7,500 / month',
          rating: 4.88,
          bio: 'Expert mentor for O/A Level English Language & Literature, Business Studies, and communication fundamentals.'
        },
        {
          name: 'Sabrina Rahman',
          email: 'sabrina@combinetution.com',
          phone: '01711998877',
          institution: 'University of Dhaka (Applied Chemistry)',
          department: 'Applied Chemistry',
          subjects: 'Chemistry, General Science',
          preferred_locations: 'Mirpur, Agargaon, Shewrapara',
          monthly_rate: '৳ 6,500 / month',
          rating: 4.90,
          bio: 'Patient and encouraging teaching approach. Helped over 40+ secondary students achieve GPA-5 in Science disciplines.'
        },
        {
          name: 'Dr. Sadman Hafiz',
          email: 'sadman@combinetution.com',
          phone: '01811334455',
          institution: 'Dhaka Medical College (MBBS)',
          department: 'Physiology & Anatomy',
          subjects: 'Biology, Chemistry, Medical Admission',
          preferred_locations: 'Dhanmondi, Green Road, Azimpur',
          monthly_rate: '৳ 12,000 / month',
          rating: 4.98,
          bio: 'Medical graduate preparing students for National Medical & Dental college entrance exams with chapter-wise MCQs.'
        },
        {
          name: 'Anika Tabassum',
          email: 'anika@combinetution.com',
          phone: '01911445566',
          institution: 'BRAC University (CSE)',
          department: 'Computer Science',
          subjects: 'ICT, Physics, Mathematics',
          preferred_locations: 'Mohakhali, Gulshan, Nikunja',
          monthly_rate: '৳ 8,500 / month',
          rating: 4.91,
          bio: 'Specialized in HSC ICT C-programming, HTML, database logic, and English Medium junior math.'
        },
        {
          name: 'Zawad Al Mahi',
          email: 'zawad@combinetution.com',
          phone: '01711556677',
          institution: 'BUET (Civil Engineering)',
          department: 'Civil Engineering',
          subjects: 'Higher Math, Physics, Mechanics',
          preferred_locations: 'Palashi, Dhanmondi, Lalmatia',
          monthly_rate: '৳ 11,000 / month',
          rating: 4.96,
          bio: 'BUET top ranker passionate about conceptual clarity for HSC and Admission Physics & Higher Math.'
        },
        {
          name: 'Noshin Sharmily',
          email: 'noshin@combinetution.com',
          phone: '01811667788',
          institution: 'Independent University Bangladesh (Pharmacy)',
          department: 'Pharmacy',
          subjects: 'Chemistry, Biology, General Science',
          preferred_locations: 'Bashundhara R/A, Baridhara',
          monthly_rate: '৳ 9,000 / month',
          rating: 4.95,
          bio: 'Experienced tutor for Cambridge O-Level Chemistry & Biology. Interactive worksheets and weekly revision sessions.'
        }
      ];

      for (const t of defaultTutors) {
        let tutorUser = this.getUserByEmail(t.email);
        if (!tutorUser) {
          const { hash, salt } = authUtils.hashPassword('TutorPassword123!');
          tutorUser = this.createUser({
            name: t.name,
            email: t.email,
            phone: t.phone,
            role: 'tutor',
            password_hash: hash,
            salt: salt,
            auth_provider: 'local'
          });
          console.log(`Seeded default Tutor: ${t.email} / TutorPassword123!`);
        }
        this.createOrUpdateTutorProfile({
          userId: tutorUser.id,
          institution: t.institution,
          department: t.department,
          subjects: t.subjects,
          preferred_locations: t.preferred_locations,
          monthly_rate: t.monthly_rate,
          rating: t.rating,
          bio: t.bio,
          is_available: 1,
          is_verified: 1
        });
      }

      // 3. Seed Sample Guardian
      let guardian = this.getUserByEmail('guardian@combinetution.com');
      if (!guardian) {
        const { hash, salt } = authUtils.hashPassword('GuardianPassword123!');
        guardian = this.createUser({
          name: 'Farhana Yasmin',
          email: 'guardian@combinetution.com',
          phone: '01712987654',
          role: 'guardian',
          password_hash: hash,
          salt: salt,
          auth_provider: 'local'
        });
        console.log('Seeded default Guardian: guardian@combinetution.com / GuardianPassword123!');
      }

      // 4. Seed Sample Student
      let student = this.getUserByEmail('student@combinetution.com');
      if (!student) {
        const { hash, salt } = authUtils.hashPassword('StudentPassword123!');
        student = this.createUser({
          name: 'Zayed Chowdhury',
          email: 'student@combinetution.com',
          phone: '01712999888',
          role: 'student',
          password_hash: hash,
          salt: salt,
          auth_provider: 'local'
        });
        console.log('Seeded default Student: student@combinetution.com / StudentPassword123!');
      }

      // 5. Seed Sample Booking Requests if empty
      const existingBookingsCount = sqliteDb.prepare('SELECT COUNT(*) as count FROM booking_requests').get().count;
      if (existingBookingsCount === 0) {
        const sampleTutor = this.getUserByEmail('tanvir@combinetution.com');
        const sampleGuardian = this.getUserByEmail('guardian@combinetution.com');
        const sampleStudent = this.getUserByEmail('student@combinetution.com');

        if (sampleTutor && (sampleGuardian || sampleStudent)) {
          const req1 = this.createBookingRequest({
            requesterId: sampleGuardian ? sampleGuardian.id : sampleStudent.id,
            requesterRole: 'guardian',
            tutorId: sampleTutor.id,
            studentGradeLevel: 'Class 10 (SSC Candidate)',
            subjects: 'Higher Mathematics, Physics',
            tuitionMedium: 'English Version',
            locationZone: 'Dhanmondi, Dhaka',
            budgetOffered: 10000,
            daysPerWeek: 3,
            preferredSchedule: 'Sun, Tue, Thu after 5:00 PM',
            specialRequirements: 'Needs focus on trigonometric problem solving and past papers.'
          });

          const req2 = this.createBookingRequest({
            requesterId: sampleStudent ? sampleStudent.id : sampleGuardian.id,
            requesterRole: 'student',
            tutorId: sampleTutor.id,
            studentGradeLevel: 'Cambridge O-Level',
            subjects: 'Pure Mathematics, Statistics',
            tuitionMedium: 'English Medium',
            locationZone: 'Gulshan 2, Dhaka',
            budgetOffered: 12000,
            daysPerWeek: 4,
            preferredSchedule: 'Mon, Wed, Fri 6:00 PM',
            specialRequirements: 'Preparation for upcoming May/June exam session.'
          });
          this.updateBookingRequestStatus({ bookingId: req2.id, changedByUserId: sampleTutor.id, status: 'accepted', remarks: 'Accepted schedule and agreed on curriculum.' });

          const req3 = this.createBookingRequest({
            requesterId: sampleGuardian ? sampleGuardian.id : sampleStudent.id,
            requesterRole: 'guardian',
            tutorId: sampleTutor.id,
            studentGradeLevel: 'Class 9',
            subjects: 'General Science, ICT',
            tuitionMedium: 'Bangla Medium',
            locationZone: 'Mirpur 10, Dhaka',
            budgetOffered: 8500,
            daysPerWeek: 3,
            preferredSchedule: 'Sat, Mon, Wed 4:00 PM',
            specialRequirements: 'Home tutor required for regular homework assistance.'
          });
          this.updateBookingRequestStatus({ bookingId: req3.id, changedByUserId: sampleTutor.id, status: 'accepted', remarks: 'Confirmed home visit schedule.' });

          const req4 = this.createBookingRequest({
            requesterId: sampleStudent ? sampleStudent.id : sampleGuardian.id,
            requesterRole: 'student',
            tutorId: sampleTutor.id,
            studentGradeLevel: 'HSC 2nd Year',
            subjects: 'Chemistry, Biology',
            tuitionMedium: 'Bangla Medium',
            locationZone: 'Uttara Sector 7, Dhaka',
            budgetOffered: 7000,
            daysPerWeek: 2,
            preferredSchedule: 'Fri, Sat morning',
            specialRequirements: 'Online or offline.'
          });
          this.updateBookingRequestStatus({ bookingId: req4.id, changedByUserId: sampleTutor.id, status: 'rejected', remarks: 'Distance too far from current tutoring hub.', rejectionReason: 'Distance too far' });

          console.log('Seeded 4 sample booking requests with full status lifecycles.');
        }
      }

      return { admin, tutorsCount: defaultTutors.length, guardian, student };
    }
  };

  // Run seed initialization
  try {
    dbDriver.seedDefaultRolesAndData();
  } catch (err) {
    console.error('Seeding error:', err);
  }
} catch (err) {
  console.warn('Note: node:sqlite not available in this Node runtime. Using persistent file store.');
}

module.exports = dbDriver;
