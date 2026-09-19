const db = require('./database');
const notificationService = require('./notification-service');

class RoutingEngine {
  /**
   * Process a newly submitted application from a guardian.
   * Automatically routes to a specific tutor or the central admin panel.
   */
  async submitAndRouteApplication(appData) {
    const {
      guardian_id = null,
      guardian_name,
      guardian_phone,
      guardian_email = '',
      target_tutor_id = null,
      student_class,
      medium,
      subjects,
      location,
      salary_budget = '',
      days_per_week = 3,
      gender_preference = 'Any',
      special_notes = ''
    } = appData;

    // Validation
    if (!guardian_name || guardian_name.trim().length < 2) {
      throw new Error('Valid guardian name is required (minimum 2 characters).');
    }
    if (!guardian_phone || guardian_phone.trim().length < 8) {
      throw new Error('Valid guardian contact phone is required.');
    }
    if (!student_class || !subjects || !location) {
      throw new Error('Class, subjects, and location are required.');
    }

    let targetTutor = null;
    let routingType = 'broadcast_admin';
    let initialStatus = 'submitted';

    // Check if target tutor is specified
    if (target_tutor_id) {
      const parsedTutorId = Number(target_tutor_id);
      targetTutor = db.getUserById(parsedTutorId);
      if (targetTutor && targetTutor.role === 'tutor') {
        routingType = 'direct_to_tutor';
        initialStatus = 'routed';
      }
    }

    // 1. Create the application record
    const application = db.createApplication({
      guardian_id: guardian_id ? Number(guardian_id) : null,
      guardian_name: guardian_name.trim(),
      guardian_phone: guardian_phone.trim(),
      guardian_email: guardian_email ? guardian_email.trim().toLowerCase() : '',
      target_tutor_id: targetTutor ? targetTutor.id : null,
      student_class: student_class.trim(),
      medium: medium ? medium.trim() : 'English Version',
      subjects: subjects.trim(),
      location: location.trim(),
      salary_budget: salary_budget ? salary_budget.trim() : 'Negotiable',
      days_per_week: Number(days_per_week) || 3,
      gender_preference: gender_preference || 'Any',
      special_notes: special_notes ? special_notes.trim() : '',
      routing_type: routingType,
      status: initialStatus
    });

    const routingResult = {
      application,
      routingType,
      assignedRoutes: [],
      notificationsSent: []
    };

    // 2. Automated Routing Execution
    if (routingType === 'direct_to_tutor' && targetTutor) {
      // Create Route for specific Tutor
      const routes = db.createApplicationRoute({
        applicationId: application.id,
        assignedToUserId: targetTutor.id,
        assignedRole: 'tutor',
        assignedBy: 'system_auto',
        status: 'pending'
      });
      routingResult.assignedRoutes = routes;

      // Notification for Target Tutor
      const tutorNotif = db.createNotification({
        userId: targetTutor.id,
        applicationId: application.id,
        type: 'new_direct_application',
        title: '🎯 Direct Tuition Request Received',
        message: `Guardian ${application.guardian_name} selected you directly for ${application.student_class} (${application.subjects}) in ${application.location}. Budget: ${application.salary_budget || 'Standard'}.`
      });
      notificationService.sendToUser(targetTutor.id, {
        event: 'new_direct_application',
        notification: tutorNotif,
        application
      });
      routingResult.notificationsSent.push(tutorNotif);

      // Notification for Admins
      const adminUsers = db.getUsersByRole('admin');
      for (const admin of adminUsers) {
        const adminNotif = db.createNotification({
          userId: admin.id,
          applicationId: application.id,
          type: 'new_direct_application',
          title: `📋 Direct Application: ${application.app_code}`,
          message: `Application from ${application.guardian_name} (${application.location}) auto-routed to Tutor ${targetTutor.name}.`
        });
        routingResult.notificationsSent.push(adminNotif);
      }

      notificationService.sendToRole('admin', {
        event: 'new_direct_application',
        application,
        targetTutor: { id: targetTutor.id, name: targetTutor.name }
      });
    } else {
      // General Broadcast: Route to Admin Panel
      const adminUsers = db.getUsersByRole('admin');
      for (const admin of adminUsers) {
        db.createApplicationRoute({
          applicationId: application.id,
          assignedToUserId: admin.id,
          assignedRole: 'admin',
          assignedBy: 'system_auto',
          status: 'pending'
        });

        const adminNotif = db.createNotification({
          userId: admin.id,
          applicationId: application.id,
          type: 'new_broadcast_application',
          title: `📢 New Tuition Application: ${application.app_code}`,
          message: `${application.guardian_name} requested a tutor for ${application.student_class} (${application.subjects}) in ${application.location}. Awaiting coordinator review.`
        });
        routingResult.notificationsSent.push(adminNotif);
      }

      notificationService.sendToRole('admin', {
        event: 'new_broadcast_application',
        application
      });
    }

    return routingResult;
  }

  /**
   * Tutor responds to an application routed to them (Accept or Decline).
   */
  async respondToApplication({ routeId, tutorUserId, status, responseNotes = '' }) {
    if (!['accepted', 'declined'].includes(status)) {
      throw new Error("Invalid response status. Must be 'accepted' or 'declined'.");
    }

    const route = db.getRouteById(routeId);
    if (!route) {
      throw new Error('Application route not found.');
    }

    // Verify ownership
    const tutor = db.getUserById(tutorUserId);
    if (!tutor) {
      throw new Error('Tutor not found.');
    }

    const updatedRoute = db.updateRouteStatus({
      routeId,
      tutorUserId,
      status,
      responseNotes: responseNotes ? responseNotes.trim() : ''
    });

    const application = db.getApplicationById(route.application_id);

    // Notify Admins in real-time
    const adminUsers = db.getUsersByRole('admin');
    const isAccepted = status === 'accepted';
    const notifType = isAccepted ? 'application_accepted' : 'application_declined';
    const notifTitle = isAccepted
      ? `✅ Tutor Accepted: ${application.app_code}`
      : `⚠️ Tutor Declined: ${application.app_code}`;
    const notifMsg = `Tutor ${tutor.name} ${status.toUpperCase()} application ${application.app_code} (${application.student_class} in ${application.location}). Notes: ${responseNotes || 'None'}`;

    for (const admin of adminUsers) {
      db.createNotification({
        userId: admin.id,
        applicationId: application.id,
        type: notifType,
        title: notifTitle,
        message: notifMsg
      });
    }

    notificationService.sendToRole('admin', {
      event: notifType,
      application,
      tutor: { id: tutor.id, name: tutor.name },
      route: updatedRoute
    });

    // Notify Guardian if registered
    if (application.guardian_id) {
      const guardianNotif = db.createNotification({
        userId: application.guardian_id,
        applicationId: application.id,
        type: notifType,
        title: isAccepted ? '🎉 Tutor Accepted Your Request!' : 'Tuition Request Update',
        message: isAccepted
          ? `Tutor ${tutor.name} has accepted your tuition request (${application.student_class}). Our academic coordinator will contact you shortly to schedule the free trial class.`
          : `Tutor ${tutor.name} is currently unavailable for your request. Our academic coordinator is assigning an alternate verified mentor.`
      });
      notificationService.sendToUser(application.guardian_id, {
        event: notifType,
        notification: guardianNotif,
        application
      });
    }

    return { updatedRoute, application };
  }

  /**
   * Admin re-routes or assigns an application to a tutor.
   */
  async adminRouteToTutor({ applicationId, adminUserId, targetTutorId, responseNotes = '' }) {
    const app = db.getApplicationById(applicationId);
    if (!app) {
      throw new Error('Application not found.');
    }

    const tutor = db.getUserById(targetTutorId);
    if (!tutor || tutor.role !== 'tutor') {
      throw new Error('Selected user is not a valid tutor.');
    }

    // Create route assignment
    const routes = db.createApplicationRoute({
      applicationId: app.id,
      assignedToUserId: tutor.id,
      assignedRole: 'tutor',
      assignedBy: 'admin_override',
      status: 'pending',
      responseNotes: responseNotes ? responseNotes.trim() : null
    });

    // Update application status and target tutor
    db.updateApplicationStatus(app.id, 'routed');

    // Notify Tutor in real-time
    const tutorNotif = db.createNotification({
      userId: tutor.id,
      applicationId: app.id,
      type: 'application_routed',
      title: '📋 New Tuition Match Assigned by Coordinator',
      message: `Coordinator assigned you to tuition ${app.app_code} for ${app.student_class} (${app.subjects}) in ${app.location}. Salary: ${app.salary_budget || 'Standard'}.`
    });

    notificationService.sendToUser(tutor.id, {
      event: 'application_routed',
      notification: tutorNotif,
      application: app
    });

    return { application: db.getApplicationById(app.id), routes };
  }
}

const routingEngine = new RoutingEngine();
module.exports = routingEngine;
