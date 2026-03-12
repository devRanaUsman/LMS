export const ROLE_PERMISSIONS = {
    EDUFLOW_ADMIN: ["*"],

    // READ_ONLY: [
    //     "*.view",
    // ],

    EDUFLOW_SALES: [
        "events.view",
        "registration.*",
        "registration.invoice",
        "registration.invoice.generate",
        "registration.invoice.send.onEmail",
        "registration.receipt",
        "registration.receipt.download",
        "registration.receipt.send.onEmail",
        "registration.ticket.send.onEmail",
        "organizers.events.create",
        "organizers.events.edit",
    ],

    MAIN_AUTHORITY: ["*"], // Super Admin: Can do everything (Add, Edit, Toggle, View)



    PRINCIPAL: [
        "dashboard.view",
        "schools.manage", // Added for K-12 Section management
        "school.manage_academics" // Added for Higher Ed HOD management
    ],

    UNIVERSITY_PRINCIPAL: [
        "dashboard.view",
        "schools.manage",
        "school.manage_academics"
    ],

    COLLEGE_PRINCIPAL: [
        "dashboard.view",
        "schools.manage",
        "school.manage_academics"
    ],

    SCHOOL_PRINCIPAL: [
        "dashboard.view",
        "schools.manage",
        "school.manage_academics"
    ],

    HOD: [
        "dashboard.view",
        "academics.manage"
    ],

    TEACHER: [
        "dashboard.view",
        "attendance.mark"
    ],

    // Legacy support or fallback if needed, otherwise these replace the old ones
    GUEST: []
};

export type Role = keyof typeof ROLE_PERMISSIONS;
export type Permission = (typeof ROLE_PERMISSIONS)[Role][number];