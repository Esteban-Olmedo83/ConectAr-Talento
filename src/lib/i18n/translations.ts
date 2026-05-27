export type LangCode =
  | 'es' | 'en' | 'pt-BR' | 'fr' | 'de' | 'it' | 'nl' | 'pt-PT' | 'ru'
  | 'zh-CN' | 'zh-TW' | 'ja' | 'ko' | 'ar' | 'tr' | 'pl' | 'cs' | 'sv'
  | 'da' | 'fi' | 'nb' | 'uk' | 'id' | 'ms' | 'th' | 'vi' | 'hi' | 'he'
  | 'ro' | 'hu' | 'sk' | 'bg' | 'hr' | 'ca' | 'eu'

export interface LangMeta {
  code: LangCode
  name: string
  label: string
  flag: string
  dir?: 'rtl'
}

export const LANGUAGES: LangMeta[] = [
  { code: 'es', name: 'Español', label: 'Spanish', flag: '🇦🇷' },
  { code: 'en', name: 'English', label: 'English', flag: '🇺🇸' },
  { code: 'pt-BR', name: 'Português (Brasil)', label: 'Portuguese (Brazil)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Português (Portugal)', label: 'Portuguese (Portugal)', flag: '🇵🇹' },
  { code: 'fr', name: 'Français', label: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', label: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', label: 'Italian', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', label: 'Dutch', flag: '🇳🇱' },
  { code: 'ru', name: 'Русский', label: 'Russian', flag: '🇷🇺' },
  { code: 'zh-CN', name: '简体中文', label: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-TW', name: '繁體中文', label: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'ja', name: '日本語', label: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', label: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', label: 'Arabic', flag: '🇸🇦', dir: 'rtl' },
  { code: 'tr', name: 'Türkçe', label: 'Turkish', flag: '🇹🇷' },
  { code: 'pl', name: 'Polski', label: 'Polish', flag: '🇵🇱' },
  { code: 'cs', name: 'Čeština', label: 'Czech', flag: '🇨🇿' },
  { code: 'sv', name: 'Svenska', label: 'Swedish', flag: '🇸🇪' },
  { code: 'da', name: 'Dansk', label: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', label: 'Finnish', flag: '🇫🇮' },
  { code: 'nb', name: 'Norsk bokmål', label: 'Norwegian', flag: '🇳🇴' },
  { code: 'uk', name: 'Українська', label: 'Ukrainian', flag: '🇺🇦' },
  { code: 'id', name: 'Bahasa Indonesia', label: 'Indonesian', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', label: 'Malay', flag: '🇲🇾' },
  { code: 'th', name: 'ภาษาไทย', label: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', label: 'Vietnamese', flag: '🇻🇳' },
  { code: 'hi', name: 'हिन्दी', label: 'Hindi', flag: '🇮🇳' },
  { code: 'he', name: 'עברית', label: 'Hebrew', flag: '🇮🇱', dir: 'rtl' },
  { code: 'ro', name: 'Română', label: 'Romanian', flag: '🇷🇴' },
  { code: 'hu', name: 'Magyar', label: 'Hungarian', flag: '🇭🇺' },
  { code: 'sk', name: 'Slovenčina', label: 'Slovak', flag: '🇸🇰' },
  { code: 'bg', name: 'Български', label: 'Bulgarian', flag: '🇧🇬' },
  { code: 'hr', name: 'Hrvatski', label: 'Croatian', flag: '🇭🇷' },
  { code: 'ca', name: 'Català', label: 'Catalan', flag: '🇦🇩' },
  { code: 'eu', name: 'Euskara', label: 'Basque', flag: '🏴' },
]

export interface Translations {
  nav: {
    sections: { main: string; tools: string; account: string }
    dashboard: string
    clients: string
    pipeline: string
    candidates: string
    talentPool: string
    vacancies: string
    interviews: string
    jobProfiles: string
    templates: string
    integrations: string
    reports: string
    settings: string
    logout: string
    admin: string
  }
  pageTitles: {
    dashboard: string
    pipeline: string
    vacancies: string
    candidates: string
    interviews: string
    settings: string
    talentPool: string
    jobProfiles: string
    templates: string
    integrations: string
    reports: string
    clients: string
    admin: string
  }
  settings: {
    tabs: {
      appearance: string
      account: string
      notifications: string
      ai: string
      language: string
    }
    language: {
      title: string
      subtitle: string
      search: string
    }
  }
  common: {
    save: string
    cancel: string
    add: string
    edit: string
    delete: string
    close: string
    confirm: string
    loading: string
    search: string
    noResults: string
    viewPipeline: string
    goToPipeline: string
  }
  stages: {
    newVacancies: string
    inProcess: string
    interviews: string
    offerSent: string
    hired: string
    discarded: string
  }
  dashboard: {
    clientFilter: string
    allClients: string
    kpiActiveCandidates: string
    kpiActiveSub: string
    kpiAiAnalyzed: string
    kpiAvgScore: string
    kpiAvgScoreSub: string
    kpiAvgTime: string
    kpiAvgTimeSub: string
    kpiActiveClients: string
    kpiActiveClientsSub: string
    kpiInactiveClients: string
    kpiInactiveClientsSub: string
    aiInsightTitle: string
    aiInsightOk: string
    aiInsightStuck: string
    funnelTitle: string
    sourcesTitle: string
    sourcesNoData: string
    topCandidatesTitle: string
    topCandidatesNoData: string
    recentActivityTitle: string
    recentActivityNoData: string
    today: string
    yesterday: string
    daysAgo: string
    inactiveClientsAlert: string
    viewClients: string
    total: string
  }
  pipeline: {
    newVacancy: string
    addCandidate: string
    searchPlaceholder: string
    allClients: string
    allVacancies: string
    allScores: string
    tabAll: string
    views: { kanban: string; list: string; detail: string }
    kpiTotal: string
    kpiNew: string
    kpiInProcess: string
    kpiInterviews: string
    kpiOffer: string
    kpiHired: string
    noApplications: string
    noCandidates: string
    actions: {
      hire: string
      consider: string
      reject: string
      scheduleInterview: string
      viewProfile: string
      moveStage: string
      addNote: string
    }
    scheduleInterview: string
    editInterview: string
    interviewForm: {
      date: string
      time: string
      type: string
      platform: string
      vacancy: string
      interviewer: string
      interviewerEmail: string
      meetingLink: string
      notes: string
      noVacancy: string
    }
    interviewTypes: { rrhh: string; technical: string; hiring: string; cultural: string }
    platforms: { presencial: string; zoom: string; meet: string; teams: string }
    rejectModal: { title: string; reasonLabel: string; notesLabel: string; skip: string; send: string }
    closeVacancy: { title: string; confirm: string; cancel: string }
    candidatesCount: string
    interviewScheduled: string
    rejectionReasons: {
      doesntMeetProfile: string
      betterCandidateSelected: string
      candidateDeclined: string
      salaryMismatch: string
      companyDecision: string
      other: string
    }
    noOtherCandidates: string
    saveNotes: string
    notesSaved: string
  }
  candidates: {
    addCandidate: string
    searchPlaceholder: string
    filters: {
      allSources: string
      allScores: string
      allStatuses: string
      allClients: string
      allVacancies: string
    }
    sortBy: string
    source: string
    gridView: string
    listView: string
    columns: {
      name: string
      email: string
      skills: string
      score: string
      date: string
      source: string
      vacancy: string
      status: string
    }
    kpis: {
      total: string
      withAI: string
      aiSub: string
      avgScore: string
      avgScoreSub: string
      thisWeek: string
    }
    pageSubtitle: string
    pageSubtitleFiltered: string
    dragCV: string
    dragCVSub: string
    scoreLabels: { excellent: string; good: string; fair: string; low: string }
    scoreFilter: { excellent: string; good: string; fair: string }
    actionsColumn: string
    hoursAgo: string
    daysAgoShort: string
    noResults: string
    noResultsSub: string
    addFirst: string
    addFirstSub: string
    addDialog: {
      title: string
      avatar: string
      changeAvatar: string
      uploadCv: string
      analyzeCv: string
      fullName: string
      email: string
      phone: string
      source: string
      vacancy: string
      skills: string
      skillsPlaceholder: string
      notes: string
      notesPlaceholder: string
      score: string
      add: string
      analyzing: string
    }
    profile: {
      title: string
      score: string
      contact: string
      skills: string
      education: string
      experience: string
      experienceYears: string
      summary: string
      strengths: string
      gaps: string
      noSummary: string
      cvFile: string
      downloadCv: string
      uploadNewCv: string
      scheduleInterview: string
      editProfile: string
      deleteCandidate: string
    }
    deleteConfirm: { title: string; message: string; cancel: string; delete: string }
  }
  vacancies: {
    newVacancy: string
    searchPlaceholder: string
    filters: { allClients: string; allPriorities: string }
    stats: { total: string; open: string; totalCandidates: string; avgDaysOpen: string }
    priorities: { high: string; medium: string; low: string }
    fields: {
      title: string
      client: string
      area: string
      location: string
      modality: string
      salary: string
      priority: string
      requirements: string
      description: string
    }
    modalities: { hybrid: string; remote: string; presencial: string }
    actions: { viewPipeline: string; assign: string; edit: string; delete: string }
    pageSub: string
    createdToday: string
    openFor: string
    assignCandidatesTitle: string
    noResultsAssign: string
    noCandidatesDB: string
    emptyStateSub: string
    noVacancies: string
    noVacanciesSub: string
    dialog: { createTitle: string; editTitle: string; save: string }
    assigned: string
    candidates: string
    created: string
    daysOpen: string
  }
  interviews: {
    schedule: string
    searchPlaceholder: string
    filters: {
      all: string
      scheduled: string
      completed: string
      cancelled: string
      allCandidates: string
      allVacancies: string
    }
    stats: { total: string; scheduled: string; today: string; thisWeek: string }
    form: {
      date: string
      time: string
      type: string
      platform: string
      vacancy: string
      interviewer: string
      interviewerEmail: string
      meetingLink: string
      notes: string
      candidate: string
    }
    types: { rrhh: string; technical: string; hiring: string; cultural: string }
    platforms: { presencial: string; zoom: string; meet: string; teams: string }
    statuses: { scheduled: string; completed: string; cancelled: string }
    noInterviews: string
    noInterviewsSub: string
    scheduled: string
    today: string
    joinMeeting: string
    markComplete: string
    cancel: string
    deleteConfirm: string
  }
  talentPool: {
    searchPlaceholder: string
    filters: {
      all: string
      active: string
      reserve: string
      discarded: string
      allScores: string
      allClients: string
    }
    stats: { total: string; active: string; reserve: string; discarded: string }
    actions: {
      viewProfile: string
      incorporate: string
      incorporated: string
      goToPipeline: string
    }
    noResults: string
    noResultsSub: string
    incorporatedMsg: string
    viewPipelineMsg: string
    card: { vacancy: string; client: string; score: string; status: string }
  }
  clients: {
    addClient: string
    searchPlaceholder: string
    pageSubtitle: string
    kpis: {
      active: string
      activeSub: string
      withVacancies: string
      withVacanciesSub: string
      assignedVacancies: string
      assignedVacanciesSub: string
      withCandidates: string
      withCandidatesSub: string
    }
    vacancyBadgeSingular: string
    vacancyBadgePlural: string
    noClientsSearch: string
    noInactiveClients: string
    noInactiveClientsSub: string
    tabs: { active: string; inactive: string }
    fields: {
      company: string
      industry: string
      contact: string
      email: string
      phone: string
      website: string
      notes: string
      logo: string
    }
    stats: {
      vacancies: string
      vacanciesSub: string
      candidates: string
      candidatesSub: string
      shortlisted: string
      shortlistedSub: string
    }
    noClients: string
    noClientsSub: string
    dialog: { createTitle: string; editTitle: string }
    deleteConfirm: string
    deleteConfirmSub: string
    detail: {
      tabs: { vacancies: string; candidates: string; history: string }
      noVacancies: string
      noCandidates: string
      noHistory: string
      pipeline: string
      backToClients: string
      notFound: string
    }
  }
  reports: {
    export: string
    period: string
    allPeriods: string
    sections: {
      overview: string
      funnel: string
      sources: string
      performance: string
      time: string
    }
    noData: string
    generate: string
  }
  integrations: {
    connected: string
    disconnected: string
    configure: string
    connect: string
    disconnect: string
    noIntegrations: string
    whatsapp: { title: string; description: string }
    linkedin: { title: string; description: string }
    calendar: { title: string; description: string }
  }
  templates: {
    new: string
    searchPlaceholder: string
    types: { offer: string; rejection: string; interview: string; followup: string }
    noTemplates: string
    noTemplatesSub: string
    dialog: { createTitle: string; editTitle: string }
    fields: { name: string; type: string; subject: string; body: string }
  }
  jobProfiles: {
    new: string
    searchPlaceholder: string
    noProfiles: string
    noProfilesSub: string
    dialog: { createTitle: string; editTitle: string }
    fields: { title: string; area: string; requirements: string; skills: string; description: string }
  }
}

// ─── Fallback (English) ───────────────────────────────────────────────────────
// Used for langs that only provide nav + pageTitles
const enFull: Translations = {
  nav: {
    sections: { main: 'Main', tools: 'Tools', account: 'Account' },
    dashboard: 'Dashboard',
    clients: 'Clients',
    pipeline: 'Pipeline',
    candidates: 'Candidates',
    talentPool: 'Talent Pool',
    vacancies: 'Vacancies',
    interviews: 'Interviews',
    jobProfiles: 'Job Profiles',
    templates: 'Templates',
    integrations: 'Integrations',
    reports: 'Reports',
    settings: 'Settings',
    logout: 'Log out',
    admin: 'Admin Panel',
  },
  pageTitles: {
    dashboard: 'Dashboard',
    pipeline: 'Recruitment Pipeline',
    vacancies: 'Vacancy Management',
    candidates: 'Candidates',
    interviews: 'Interviews',
    settings: 'Settings',
    talentPool: 'Talent Pool',
    jobProfiles: 'Job Profiles',
    templates: 'Templates',
    integrations: 'Integrations',
    reports: 'Reports',
    clients: 'Clients',
    admin: 'Administration',
  },
  settings: {
    tabs: {
      appearance: 'Appearance',
      account: 'Account',
      notifications: 'Notifications',
      ai: 'AI Connection',
      language: 'Language',
    },
    language: {
      title: 'Language',
      subtitle: 'Choose the language for the interface',
      search: 'Search language...',
    },
  },
  common: {
    save: 'Save',
    cancel: 'Cancel',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    close: 'Close',
    confirm: 'Confirm',
    loading: 'Loading...',
    search: 'Search',
    noResults: 'No results',
    viewPipeline: 'View pipeline',
    goToPipeline: 'Go to pipeline',
  },
  stages: {
    newVacancies: 'New Vacancies',
    inProcess: 'In Process',
    interviews: 'Interviews',
    offerSent: 'Offer Sent',
    hired: 'Hired',
    discarded: 'Discarded',
  },
  dashboard: {
    clientFilter: 'Client',
    allClients: 'All',
    kpiActiveCandidates: 'Active Candidates',
    kpiActiveSub: 'in database',
    kpiAiAnalyzed: 'AI-analyzed CVs',
    kpiAvgScore: 'Average ATS Score',
    kpiAvgScoreSub: 'out of 100 points',
    kpiAvgTime: 'Avg. time per stage',
    kpiAvgTimeSub: 'historical average',
    kpiActiveClients: 'Active Clients',
    kpiActiveClientsSub: 'with active processes',
    kpiInactiveClients: 'Inactive Clients',
    kpiInactiveClientsSub: 'history saved',
    aiInsightTitle: 'AI Insight',
    aiInsightOk: 'All up to date — no candidates stuck at any pipeline stage.',
    aiInsightStuck: 'candidates have been in "Interviews" for 5+ days without progress. Review their status to speed up the process.',
    funnelTitle: 'Recruitment Funnel',
    sourcesTitle: 'Candidate Sources',
    sourcesNoData: 'No data',
    topCandidatesTitle: 'Top Candidates by ATS Score',
    topCandidatesNoData: 'No candidates with AI score.',
    recentActivityTitle: 'Recent Activity',
    recentActivityNoData: 'No recent activity.',
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: 'days ago',
    inactiveClientsAlert: 'You have {n} inactive client(s) with saved history.',
    viewClients: 'View clients',
    total: 'total',
  },
  pipeline: {
    newVacancy: 'New Vacancy',
    addCandidate: 'Add Candidate',
    searchPlaceholder: 'Search candidates...',
    allClients: 'All clients',
    allVacancies: 'All vacancies',
    allScores: 'All scores',
    tabAll: 'All',
    views: { kanban: 'Kanban', list: 'List', detail: 'Detail' },
    kpiTotal: 'Total',
    kpiNew: 'New',
    kpiInProcess: 'In Process',
    kpiInterviews: 'Interviews',
    kpiOffer: 'Offer',
    kpiHired: 'Hired',
    noApplications: 'No applications in this stage.',
    noCandidates: 'No candidates found.',
    actions: {
      hire: 'Hire',
      consider: 'Consider',
      reject: 'Reject',
      scheduleInterview: 'Schedule Interview',
      viewProfile: 'View Profile',
      moveStage: 'Move Stage',
      addNote: 'Add Note',
    },
    scheduleInterview: 'Schedule Interview',
    editInterview: 'Edit Interview',
    interviewForm: {
      date: 'Date',
      time: 'Time',
      type: 'Interview Type',
      platform: 'Platform',
      vacancy: 'Vacancy',
      interviewer: 'Interviewer',
      interviewerEmail: 'Interviewer Email',
      meetingLink: 'Meeting Link (optional)',
      notes: 'Notes',
      noVacancy: 'No vacancy assigned',
    },
    interviewTypes: {
      rrhh: 'HR',
      technical: 'Technical',
      hiring: 'With Hiring Manager',
      cultural: 'Cultural',
    },
    platforms: {
      presencial: 'In-person',
      zoom: 'Zoom',
      meet: 'Google Meet',
      teams: 'Teams',
    },
    rejectModal: {
      title: 'Reject Candidate',
      reasonLabel: 'Reason',
      notesLabel: 'Notes (optional)',
      skip: 'Skip',
      send: 'Send',
    },
    closeVacancy: {
      title: 'Close Vacancy',
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
    candidatesCount: 'candidates',
    interviewScheduled: 'Interview scheduled',
    rejectionReasons: {
      doesntMeetProfile: "Doesn't meet the profile",
      betterCandidateSelected: 'Better candidate selected',
      candidateDeclined: 'Candidate declined',
      salaryMismatch: 'Salary mismatch',
      companyDecision: 'Company decision',
      other: 'Other reason',
    },
    noOtherCandidates: 'No other candidates in this process.',
    saveNotes: 'Save notes',
    notesSaved: 'Saved',
  },
  candidates: {
    addCandidate: 'Add Candidate',
    searchPlaceholder: 'Search by name or email...',
    kpis: {
      total: 'Total Candidates',
      withAI: 'AI-analyzed CVs',
      aiSub: '{n}% of total',
      avgScore: 'Average Score',
      avgScoreSub: 'out of 100',
      thisWeek: 'This Week',
    },
    pageSubtitle: '{n} candidates in the database',
    pageSubtitleFiltered: '{n} candidates found',
    dragCV: 'Drag a CV here or click to select',
    dragCVSub: 'PDF or TXT · AI extracts name, skills and calculates ATS score · File attached to the record',
    scoreLabels: { excellent: 'Excellent', good: 'Good', fair: 'Fair', low: 'Low' },
    scoreFilter: { excellent: 'Excellent (80+)', good: 'Good (60-79)', fair: 'Fair (40-59)' },
    actionsColumn: 'Actions',
    hoursAgo: '{n}h ago',
    daysAgoShort: '{n}d ago',
    filters: {
      allSources: 'All sources',
      allScores: 'All scores',
      allStatuses: 'All statuses',
      allClients: 'All clients',
      allVacancies: 'All vacancies',
    },
    sortBy: 'Sort by',
    source: 'Source',
    gridView: 'Grid view',
    listView: 'List view',
    columns: {
      name: 'Name',
      email: 'Email',
      skills: 'Skills',
      score: 'Score',
      date: 'Date',
      source: 'Source',
      vacancy: 'Vacancy',
      status: 'Status',
    },
    noResults: 'No candidates found',
    noResultsSub: 'Try different search terms or filters.',
    addFirst: 'Add your first candidate',
    addFirstSub: 'Start building your candidate database.',
    addDialog: {
      title: 'Add Candidate',
      avatar: 'Photo',
      changeAvatar: 'Change photo',
      uploadCv: 'Upload CV',
      analyzeCv: 'Analyze with AI',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      source: 'Source',
      vacancy: 'Vacancy',
      skills: 'Skills',
      skillsPlaceholder: 'React, TypeScript, Python...',
      notes: 'Notes',
      notesPlaceholder: 'Additional observations...',
      score: 'ATS Score',
      add: 'Add Candidate',
      analyzing: 'Analyzing...',
    },
    profile: {
      title: 'Candidate Profile',
      score: 'ATS Score',
      contact: 'Contact',
      skills: 'Skills',
      education: 'Education',
      experience: 'Experience',
      experienceYears: 'years',
      summary: 'AI Summary',
      strengths: 'Strengths',
      gaps: 'Gaps',
      noSummary: 'No AI summary available.',
      cvFile: 'CV File',
      downloadCv: 'Download CV',
      uploadNewCv: 'Upload new CV',
      scheduleInterview: 'Schedule Interview',
      editProfile: 'Edit Profile',
      deleteCandidate: 'Delete Candidate',
    },
    deleteConfirm: {
      title: 'Delete Candidate',
      message: 'This action cannot be undone.',
      cancel: 'Cancel',
      delete: 'Delete',
    },
  },
  vacancies: {
    newVacancy: 'New Vacancy',
    searchPlaceholder: 'Search vacancies...',
    filters: { allClients: 'All clients', allPriorities: 'All priorities' },
    stats: {
      total: 'Total Vacancies',
      open: 'Open',
      totalCandidates: 'Total Candidates',
      avgDaysOpen: 'Avg. Days Open',
    },
    priorities: { high: 'High', medium: 'Medium', low: 'Low' },
    fields: {
      title: 'Job Title',
      client: 'Client (company)',
      area: 'Department',
      location: 'Location',
      modality: 'Modality',
      salary: 'Salary',
      priority: 'Priority',
      requirements: 'Required Skills (comma-separated)',
      description: 'Job Description',
    },
    modalities: { hybrid: 'Hybrid', remote: 'Remote', presencial: 'On-site' },
    actions: {
      viewPipeline: 'View pipeline',
      assign: 'Assign',
      edit: 'Edit',
      delete: 'Delete',
    },
    pageSub: '{n} open vacancies',
    createdToday: 'Created today',
    openFor: 'Open for {n} day(s)',
    assignCandidatesTitle: 'Assign candidates',
    noResultsAssign: 'No results',
    noCandidatesDB: 'No candidates in the database',
    emptyStateSub: 'Post a vacancy and start receiving candidates today.',
    noVacancies: 'Create your first search',
    noVacanciesSub: 'Post a vacancy and start receiving candidates today.',
    dialog: { createTitle: 'New Vacancy', editTitle: 'Edit Vacancy', save: 'Save' },
    assigned: 'assigned',
    candidates: 'candidates',
    created: 'Created',
    daysOpen: 'days open',
  },
  interviews: {
    schedule: 'Schedule Interview',
    searchPlaceholder: 'Search interviews...',
    filters: {
      all: 'All',
      scheduled: 'Scheduled',
      completed: 'Completed',
      cancelled: 'Cancelled',
      allCandidates: 'All candidates',
      allVacancies: 'All vacancies',
    },
    stats: {
      total: 'Total',
      scheduled: 'Scheduled',
      today: 'Today',
      thisWeek: 'This Week',
    },
    form: {
      date: 'Date',
      time: 'Time',
      type: 'Interview Type',
      platform: 'Platform',
      vacancy: 'Vacancy',
      interviewer: 'Interviewer',
      interviewerEmail: 'Interviewer Email',
      meetingLink: 'Meeting Link (optional)',
      notes: 'Previous Notes',
      candidate: 'Candidate',
    },
    types: {
      rrhh: 'HR',
      technical: 'Technical',
      hiring: 'With Hiring Manager',
      cultural: 'Cultural',
    },
    platforms: {
      presencial: 'In-person',
      zoom: 'Zoom',
      meet: 'Google Meet',
      teams: 'Teams',
    },
    statuses: {
      scheduled: 'Scheduled',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    noInterviews: 'No interviews found',
    noInterviewsSub: 'Schedule your first interview from the pipeline.',
    scheduled: 'Scheduled',
    today: 'Today',
    joinMeeting: 'Join Meeting',
    markComplete: 'Mark Complete',
    cancel: 'Cancel',
    deleteConfirm: 'Are you sure you want to delete this interview?',
  },
  talentPool: {
    searchPlaceholder: 'Search talent pool...',
    filters: {
      all: 'All',
      active: 'Active',
      reserve: 'Reserve',
      discarded: 'Discarded',
      allScores: 'All scores',
      allClients: 'All clients',
    },
    stats: {
      total: 'Total',
      active: 'Active',
      reserve: 'Reserve',
      discarded: 'Discarded',
    },
    actions: {
      viewProfile: 'View Profile',
      incorporate: 'Incorporate',
      incorporated: 'Incorporated',
      goToPipeline: 'Go to Pipeline',
    },
    noResults: 'No talent found',
    noResultsSub: 'Add candidates to start building your talent pool.',
    incorporatedMsg: 'Candidate incorporated to pipeline.',
    viewPipelineMsg: 'View in pipeline',
    card: {
      vacancy: 'Vacancy',
      client: 'Client',
      score: 'Score',
      status: 'Status',
    },
  },
  clients: {
    addClient: 'Add Client',
    searchPlaceholder: 'Search clients...',
    pageSubtitle: 'Companies for which you manage selection processes',
    kpis: {
      active: 'Active Clients',
      activeSub: 'of {n} in your plan',
      withVacancies: 'With open vacancies',
      withVacanciesSub: 'with active processes',
      assignedVacancies: 'Assigned vacancies',
      assignedVacanciesSub: 'linked to a client',
      withCandidates: 'With candidates in process',
      withCandidatesSub: 'with active applicants',
    },
    vacancyBadgeSingular: 'active vacancy',
    vacancyBadgePlural: 'active vacancies',
    noClientsSearch: 'Try a different search term.',
    noInactiveClients: 'No inactive clients in history',
    noInactiveClientsSub: 'Deactivated clients will appear here with their event history.',
    tabs: { active: 'Active', inactive: 'Inactive' },
    fields: {
      company: 'Company',
      industry: 'Industry',
      contact: 'Contact',
      email: 'Email',
      phone: 'Phone',
      website: 'Website',
      notes: 'Internal Notes',
      logo: 'Logo',
    },
    stats: {
      vacancies: 'Vacancies',
      vacanciesSub: 'for this client',
      candidates: 'Candidates',
      candidatesSub: 'total',
      shortlisted: 'Shortlisted',
      shortlistedSub: 'in final stages',
    },
    noClients: 'No clients yet',
    noClientsSub: 'Add your first client to start managing processes.',
    dialog: { createTitle: 'New Client', editTitle: 'Edit Client' },
    deleteConfirm: 'Delete client?',
    deleteConfirmSub: 'Linked vacancies will be left without an assigned client.',
    detail: {
      tabs: { vacancies: 'Vacancies', candidates: 'Candidates', history: 'History' },
      noVacancies: 'No vacancies for this client.',
      noCandidates: 'No candidates for this client.',
      noHistory: 'No history recorded.',
      pipeline: 'Pipeline',
      backToClients: 'Back to Clients',
      notFound: 'Client not found',
    },
  },
  reports: {
    export: 'Export',
    period: 'Period',
    allPeriods: 'All periods',
    sections: {
      overview: 'Overview',
      funnel: 'Funnel',
      sources: 'Sources',
      performance: 'Performance',
      time: 'Time',
    },
    noData: 'No data available for this period.',
    generate: 'Generate Report',
  },
  integrations: {
    connected: 'Connected',
    disconnected: 'Disconnected',
    configure: 'Configure',
    connect: 'Connect',
    disconnect: 'Disconnect',
    noIntegrations: 'No integrations configured.',
    whatsapp: {
      title: 'WhatsApp Business',
      description: 'Send messages and confirmations directly via WhatsApp.',
    },
    linkedin: {
      title: 'LinkedIn',
      description: 'Post vacancies and search candidates on LinkedIn.',
    },
    calendar: {
      title: 'Google Calendar / Outlook',
      description: 'Sync interviews with your calendar automatically.',
    },
  },
  templates: {
    new: 'New Template',
    searchPlaceholder: 'Search templates...',
    types: {
      offer: 'Offer',
      rejection: 'Rejection',
      interview: 'Interview',
      followup: 'Follow-up',
    },
    noTemplates: 'No templates found',
    noTemplatesSub: 'Create your first template to speed up communications.',
    dialog: { createTitle: 'New Template', editTitle: 'Edit Template' },
    fields: {
      name: 'Template Name',
      type: 'Type',
      subject: 'Subject',
      body: 'Body',
    },
  },
  jobProfiles: {
    new: 'New Profile',
    searchPlaceholder: 'Search profiles...',
    noProfiles: 'No profiles found',
    noProfilesSub: 'Create job profiles to speed up vacancy creation.',
    dialog: { createTitle: 'New Job Profile', editTitle: 'Edit Job Profile' },
    fields: {
      title: 'Profile Title',
      area: 'Area / Department',
      requirements: 'Requirements',
      skills: 'Skills',
      description: 'Description',
    },
  },
}

// ─── Helper to build a partial translation merged with EN fallback ─────────────
function withFallback(
  nav: Translations['nav'],
  pageTitles: Translations['pageTitles']
): Translations {
  return {
    nav,
    pageTitles,
    settings: enFull.settings,
    common: enFull.common,
    stages: enFull.stages,
    dashboard: enFull.dashboard,
    pipeline: enFull.pipeline,
    candidates: enFull.candidates,
    vacancies: enFull.vacancies,
    interviews: enFull.interviews,
    talentPool: enFull.talentPool,
    clients: enFull.clients,
    reports: enFull.reports,
    integrations: enFull.integrations,
    templates: enFull.templates,
    jobProfiles: enFull.jobProfiles,
  }
}

// ─── Full translations ────────────────────────────────────────────────────────

const es: Translations = {
  nav: {
    sections: { main: 'Principal', tools: 'Herramientas', account: 'Cuenta' },
    dashboard: 'Dashboard',
    clients: 'Clientes',
    pipeline: 'Procesos',
    candidates: 'Candidatos',
    talentPool: 'Banco de Talento',
    vacancies: 'Vacantes',
    interviews: 'Entrevistas',
    jobProfiles: 'Perfiles de Puestos',
    templates: 'Plantillas',
    integrations: 'Integraciones',
    reports: 'Informes',
    settings: 'Configuración',
    logout: 'Cerrar sesión',
    admin: 'Panel de Admin',
  },
  pageTitles: {
    dashboard: 'Dashboard',
    pipeline: 'Procesos de reclutamiento',
    vacancies: 'Gestión de Vacantes',
    candidates: 'Candidatos',
    interviews: 'Entrevistas',
    settings: 'Configuración',
    talentPool: 'Banco de Talentos',
    jobProfiles: 'Perfiles de Puestos',
    templates: 'Plantillas',
    integrations: 'Integraciones',
    reports: 'Informes',
    clients: 'Clientes',
    admin: 'Administración',
  },
  settings: {
    tabs: {
      appearance: 'Apariencia',
      account: 'Cuenta',
      notifications: 'Notificaciones',
      ai: 'Conexión con IAs',
      language: 'Idioma',
    },
    language: {
      title: 'Idioma',
      subtitle: 'Elegí el idioma de la interfaz',
      search: 'Buscar idioma...',
    },
  },
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    add: 'Agregar',
    edit: 'Editar',
    delete: 'Eliminar',
    close: 'Cerrar',
    confirm: 'Confirmar',
    loading: 'Cargando...',
    search: 'Buscar',
    noResults: 'Sin resultados',
    viewPipeline: 'Ver procesos',
    goToPipeline: 'Ir a Procesos',
  },
  stages: {
    newVacancies: 'Nuevas Vacantes',
    inProcess: 'En Proceso',
    interviews: 'Entrevistas',
    offerSent: 'Oferta Enviada',
    hired: 'Contratado',
    discarded: 'Descartado',
  },
  dashboard: {
    clientFilter: 'Cliente',
    allClients: 'Todos',
    kpiActiveCandidates: 'Candidatos activos',
    kpiActiveSub: 'en base de datos',
    kpiAiAnalyzed: 'CVs analizados con IA',
    kpiAvgScore: 'Score ATS promedio',
    kpiAvgScoreSub: 'sobre 100 puntos',
    kpiAvgTime: 'Tiempo prom. por etapa',
    kpiAvgTimeSub: 'promedio histórico',
    kpiActiveClients: 'Clientes activos',
    kpiActiveClientsSub: 'con procesos en curso',
    kpiInactiveClients: 'Clientes inactivos',
    kpiInactiveClientsSub: 'historial guardado',
    aiInsightTitle: 'Insight de IA',
    aiInsightOk: 'Todo al día — sin candidatos paralizados en ninguna etapa del pipeline.',
    aiInsightStuck: 'candidatos llevan 5+ días en etapa "Entrevistas" sin avance. Revisá su estado para acelerar el proceso.',
    funnelTitle: 'Funnel de reclutamiento',
    sourcesTitle: 'Fuentes de candidatos',
    sourcesNoData: 'Sin datos',
    topCandidatesTitle: 'Top candidatos por score ATS',
    topCandidatesNoData: 'Sin candidatos con score IA.',
    recentActivityTitle: 'Actividad reciente',
    recentActivityNoData: 'Sin actividad reciente.',
    today: 'Hoy',
    yesterday: 'Ayer',
    daysAgo: 'Hace {n}d',
    inactiveClientsAlert: 'Tenés {n} cliente(s) inactivo(s) con historial guardado.',
    viewClients: 'Ver clientes',
    total: 'total',
  },
  pipeline: {
    newVacancy: 'Nueva Vacante',
    addCandidate: 'Agregar Candidato',
    searchPlaceholder: 'Buscar candidatos...',
    allClients: 'Todos los clientes',
    allVacancies: 'Todas las vacantes',
    allScores: 'Todos los scores',
    tabAll: 'Todos',
    views: { kanban: 'Kanban', list: 'Lista', detail: 'Detalle' },
    kpiTotal: 'Total',
    kpiNew: 'Nuevos',
    kpiInProcess: 'En Proceso',
    kpiInterviews: 'Entrevistas',
    kpiOffer: 'Oferta',
    kpiHired: 'Contratados',
    noApplications: 'Sin candidatos en esta etapa.',
    noCandidates: 'Sin candidatos encontrados.',
    actions: {
      hire: 'Contratar',
      consider: 'A considerar',
      reject: 'Rechazar',
      scheduleInterview: 'Agendar Entrevista',
      viewProfile: 'Ver Perfil',
      moveStage: 'Mover etapa',
      addNote: 'Agregar nota',
    },
    scheduleInterview: 'Agendar entrevista',
    editInterview: 'Editar entrevista',
    interviewForm: {
      date: 'Fecha',
      time: 'Hora',
      type: 'Tipo de entrevista',
      platform: 'Plataforma',
      vacancy: 'Vacante',
      interviewer: 'Entrevistador',
      interviewerEmail: 'Email del entrevistador',
      meetingLink: 'Link de reunión (opcional)',
      notes: 'Notas previas',
      noVacancy: 'Sin vacante asignada',
    },
    interviewTypes: {
      rrhh: 'RRHH',
      technical: 'Técnica',
      hiring: 'Con Hiring Manager',
      cultural: 'Cultural',
    },
    platforms: {
      presencial: 'Presencial',
      zoom: 'Zoom',
      meet: 'Google Meet',
      teams: 'Teams',
    },
    rejectModal: {
      title: 'Rechazar candidato',
      reasonLabel: 'Motivo',
      notesLabel: 'Notas (opcional)',
      skip: 'Omitir',
      send: 'Enviar',
    },
    closeVacancy: {
      title: 'Cerrar vacante',
      confirm: 'Confirmar',
      cancel: 'Cancelar',
    },
    candidatesCount: 'candidatos',
    interviewScheduled: 'Entrevista agendada',
    rejectionReasons: {
      doesntMeetProfile: 'No cumple el perfil',
      betterCandidateSelected: 'Mejor candidato seleccionado',
      candidateDeclined: 'Candidato declinó',
      salaryMismatch: 'Fuera de rango salarial',
      companyDecision: 'Decisión empresarial',
      other: 'Otro motivo',
    },
    noOtherCandidates: 'No hay otros candidatos en este proceso.',
    saveNotes: 'Guardar notas',
    notesSaved: 'Guardado',
  },
  candidates: {
    addCandidate: 'Agregar Candidato',
    searchPlaceholder: 'Buscar por nombre o email...',
    kpis: {
      total: 'Total Candidatos',
      withAI: 'CVs con IA',
      aiSub: '{n}% del total',
      avgScore: 'Score Promedio',
      avgScoreSub: 'sobre 100',
      thisWeek: 'Esta Semana',
    },
    pageSubtitle: '{n} candidatos en la base de datos',
    pageSubtitleFiltered: '{n} candidatos encontrados',
    dragCV: 'Arrastrá un CV aquí o hacé clic para seleccionar',
    dragCVSub: 'PDF o TXT · La IA extrae nombre, skills y calcula score ATS · El archivo queda adjunto en la ficha',
    scoreLabels: { excellent: 'Excelente', good: 'Bueno', fair: 'Regular', low: 'Bajo' },
    scoreFilter: { excellent: 'Excelente (80+)', good: 'Bueno (60-79)', fair: 'Regular (40-59)' },
    actionsColumn: 'Acciones',
    hoursAgo: 'hace {n}h',
    daysAgoShort: 'hace {n}d',
    filters: {
      allSources: 'Todas las fuentes',
      allScores: 'Todos los scores',
      allStatuses: 'Todos los estados',
      allClients: 'Todos los clientes',
      allVacancies: 'Todas las vacantes',
    },
    sortBy: 'Ordenar por',
    source: 'Fuente',
    gridView: 'Vista grilla',
    listView: 'Vista lista',
    columns: {
      name: 'Nombre',
      email: 'Email',
      skills: 'Skills',
      score: 'Score',
      date: 'Fecha',
      source: 'Fuente',
      vacancy: 'Vacante',
      status: 'Estado',
    },
    noResults: 'Sin candidatos encontrados',
    noResultsSub: 'Probá con otros términos o filtros.',
    addFirst: 'Agregá tu primer candidato',
    addFirstSub: 'Comenzá a construir tu base de candidatos.',
    addDialog: {
      title: 'Agregar Candidato',
      avatar: 'Foto',
      changeAvatar: 'Cambiar foto',
      uploadCv: 'Subir CV',
      analyzeCv: 'Analizar con IA',
      fullName: 'Nombre completo',
      email: 'Email',
      phone: 'Teléfono',
      source: 'Fuente',
      vacancy: 'Vacante',
      skills: 'Skills',
      skillsPlaceholder: 'React, TypeScript, Python...',
      notes: 'Notas',
      notesPlaceholder: 'Observaciones adicionales...',
      score: 'Score ATS',
      add: 'Agregar Candidato',
      analyzing: 'Analizando...',
    },
    profile: {
      title: 'Perfil del candidato',
      score: 'Score ATS',
      contact: 'Contacto',
      skills: 'Skills',
      education: 'Educación',
      experience: 'Experiencia',
      experienceYears: 'años',
      summary: 'Resumen IA',
      strengths: 'Fortalezas',
      gaps: 'Brechas',
      noSummary: 'Sin resumen IA disponible.',
      cvFile: 'Archivo CV',
      downloadCv: 'Descargar CV',
      uploadNewCv: 'Subir nuevo CV',
      scheduleInterview: 'Agendar entrevista',
      editProfile: 'Editar perfil',
      deleteCandidate: 'Eliminar candidato',
    },
    deleteConfirm: {
      title: 'Eliminar candidato',
      message: 'Esta acción no se puede deshacer.',
      cancel: 'Cancelar',
      delete: 'Eliminar',
    },
  },
  vacancies: {
    newVacancy: 'Nueva Vacante',
    searchPlaceholder: 'Buscar vacante...',
    filters: { allClients: 'Todos los clientes', allPriorities: 'Todas las prioridades' },
    stats: {
      total: 'Total Vacantes',
      open: 'Abiertas',
      totalCandidates: 'Candidatos Totales',
      avgDaysOpen: 'Días Promedio Abierta',
    },
    priorities: { high: 'Alta', medium: 'Media', low: 'Baja' },
    fields: {
      title: 'Título del puesto',
      client: 'Cliente (empresa)',
      area: 'Departamento',
      location: 'Ubicación',
      modality: 'Modalidad',
      salary: 'Salario',
      priority: 'Prioridad',
      requirements: 'Skills requeridas (separadas por coma)',
      description: 'Descripción del puesto',
    },
    modalities: { hybrid: 'Híbrido', remote: 'Remoto', presencial: 'Presencial' },
    actions: {
      viewPipeline: 'Ver procesos',
      assign: 'Asignar',
      edit: 'Editar',
      delete: 'Eliminar',
    },
    pageSub: '{n} vacantes abiertas',
    createdToday: 'Creada hoy',
    openFor: 'Abierta hace {n} día(s)',
    assignCandidatesTitle: 'Asignar candidatos',
    noResultsAssign: 'Sin resultados',
    noCandidatesDB: 'No hay candidatos en la base de datos',
    emptyStateSub: 'Publicá una vacante y empezá a recibir candidatos hoy.',
    noVacancies: 'Creá tu primera búsqueda',
    noVacanciesSub: 'Publicá una vacante y empezá a recibir candidatos hoy.',
    dialog: { createTitle: 'Nueva vacante', editTitle: 'Editar vacante', save: 'Guardar' },
    assigned: 'asignados',
    candidates: 'candidatos',
    created: 'Creada',
    daysOpen: 'días abierta',
  },
  interviews: {
    schedule: 'Agendar Entrevista',
    searchPlaceholder: 'Buscar entrevistas...',
    filters: {
      all: 'Todas',
      scheduled: 'Programadas',
      completed: 'Completadas',
      cancelled: 'Canceladas',
      allCandidates: 'Todos los candidatos',
      allVacancies: 'Todas las vacantes',
    },
    stats: {
      total: 'Total',
      scheduled: 'Programadas',
      today: 'Hoy',
      thisWeek: 'Esta semana',
    },
    form: {
      date: 'Fecha',
      time: 'Hora',
      type: 'Tipo de entrevista',
      platform: 'Plataforma',
      vacancy: 'Vacante',
      interviewer: 'Entrevistador',
      interviewerEmail: 'Email del entrevistador',
      meetingLink: 'Link de reunión (opcional)',
      notes: 'Notas previas',
      candidate: 'Candidato',
    },
    types: {
      rrhh: 'RRHH',
      technical: 'Técnica',
      hiring: 'Con Hiring Manager',
      cultural: 'Cultural',
    },
    platforms: {
      presencial: 'Presencial',
      zoom: 'Zoom',
      meet: 'Google Meet',
      teams: 'Teams',
    },
    statuses: {
      scheduled: 'Programada',
      completed: 'Completada',
      cancelled: 'Cancelada',
    },
    noInterviews: 'Sin entrevistas encontradas',
    noInterviewsSub: 'Agendá tu primera entrevista desde el pipeline.',
    scheduled: 'Programada',
    today: 'Hoy',
    joinMeeting: 'Unirse a la reunión',
    markComplete: 'Marcar completada',
    cancel: 'Cancelar',
    deleteConfirm: '¿Eliminar esta entrevista?',
  },
  talentPool: {
    searchPlaceholder: 'Buscar en el banco de talentos...',
    filters: {
      all: 'Todos',
      active: 'Activos',
      reserve: 'Reserva',
      discarded: 'Descartados',
      allScores: 'Todos los scores',
      allClients: 'Todos los clientes',
    },
    stats: {
      total: 'Total',
      active: 'Activos',
      reserve: 'Reserva',
      discarded: 'Descartados',
    },
    actions: {
      viewProfile: 'Ver perfil',
      incorporate: 'Incorporar',
      incorporated: 'Incorporado',
      goToPipeline: 'Ir al Pipeline',
    },
    noResults: 'Sin talentos encontrados',
    noResultsSub: 'Agregá candidatos para construir tu banco de talentos.',
    incorporatedMsg: 'Candidato incorporado al pipeline.',
    viewPipelineMsg: 'Ver en pipeline',
    card: {
      vacancy: 'Vacante',
      client: 'Cliente',
      score: 'Score',
      status: 'Estado',
    },
  },
  clients: {
    addClient: 'Agregar Cliente',
    searchPlaceholder: 'Buscar clientes...',
    pageSubtitle: 'Empresas para las que gestionás procesos de selección',
    kpis: {
      active: 'Clientes activos',
      activeSub: 'de {n} en tu plan',
      withVacancies: 'Con vacantes abiertas',
      withVacanciesSub: 'tienen procesos activos',
      assignedVacancies: 'Vacantes asignadas',
      assignedVacanciesSub: 'vinculadas a un cliente',
      withCandidates: 'Con candidatos en proceso',
      withCandidatesSub: 'con postulantes activos',
    },
    vacancyBadgeSingular: 'vacante activa',
    vacancyBadgePlural: 'vacantes activas',
    noClientsSearch: 'Probá con otro término de búsqueda.',
    noInactiveClients: 'Sin clientes inactivos en el historial',
    noInactiveClientsSub: 'Los clientes desactivados aparecerán aquí con su historial de eventos.',
    tabs: { active: 'Activos', inactive: 'Inactivos' },
    fields: {
      company: 'Empresa',
      industry: 'Industria',
      contact: 'Contacto',
      email: 'Email',
      phone: 'Teléfono',
      website: 'Sitio web',
      notes: 'Notas internas',
      logo: 'Logo',
    },
    stats: {
      vacancies: 'Vacantes',
      vacanciesSub: 'en este cliente',
      candidates: 'Candidatos',
      candidatesSub: 'en total',
      shortlisted: 'En shortlist',
      shortlistedSub: 'en etapas finales',
    },
    noClients: 'Sin clientes aún',
    noClientsSub: 'Agregá tu primer cliente para empezar a gestionar procesos.',
    dialog: { createTitle: 'Nuevo Cliente', editTitle: 'Editar cliente' },
    deleteConfirm: '¿Eliminar cliente?',
    deleteConfirmSub: 'Las vacantes vinculadas quedarán sin cliente asignado.',
    detail: {
      tabs: { vacancies: 'Vacantes', candidates: 'Candidatos', history: 'Historial' },
      noVacancies: 'Sin vacantes para este cliente.',
      noCandidates: 'Sin candidatos para este cliente.',
      noHistory: 'Sin historial registrado.',
      pipeline: 'Pipeline',
      backToClients: 'Volver a Clientes',
      notFound: 'Cliente no encontrado',
    },
  },
  reports: {
    export: 'Exportar',
    period: 'Período',
    allPeriods: 'Todos los períodos',
    sections: {
      overview: 'Resumen',
      funnel: 'Embudo',
      sources: 'Fuentes',
      performance: 'Rendimiento',
      time: 'Tiempo',
    },
    noData: 'Sin datos disponibles para este período.',
    generate: 'Generar Informe',
  },
  integrations: {
    connected: 'Conectado',
    disconnected: 'Desconectado',
    configure: 'Configurar',
    connect: 'Conectar',
    disconnect: 'Desconectar',
    noIntegrations: 'Sin integraciones configuradas.',
    whatsapp: {
      title: 'WhatsApp Business',
      description: 'Enviá mensajes y confirmaciones directo por WhatsApp.',
    },
    linkedin: {
      title: 'LinkedIn',
      description: 'Publicá vacantes y buscá candidatos en LinkedIn.',
    },
    calendar: {
      title: 'Google Calendar / Outlook',
      description: 'Sincronizá las entrevistas con tu calendario automáticamente.',
    },
  },
  templates: {
    new: 'Nueva Plantilla',
    searchPlaceholder: 'Buscar plantillas...',
    types: {
      offer: 'Oferta',
      rejection: 'Rechazo',
      interview: 'Entrevista',
      followup: 'Seguimiento',
    },
    noTemplates: 'Sin plantillas encontradas',
    noTemplatesSub: 'Creá tu primera plantilla para agilizar las comunicaciones.',
    dialog: { createTitle: 'Nueva Plantilla', editTitle: 'Editar Plantilla' },
    fields: {
      name: 'Nombre de la plantilla',
      type: 'Tipo',
      subject: 'Asunto',
      body: 'Cuerpo',
    },
  },
  jobProfiles: {
    new: 'Nuevo Perfil',
    searchPlaceholder: 'Buscar perfiles...',
    noProfiles: 'Sin perfiles encontrados',
    noProfilesSub: 'Creá perfiles de puestos para agilizar la carga de vacantes.',
    dialog: { createTitle: 'Nuevo Perfil de Puesto', editTitle: 'Editar Perfil de Puesto' },
    fields: {
      title: 'Título del perfil',
      area: 'Área / Departamento',
      requirements: 'Requisitos',
      skills: 'Skills',
      description: 'Descripción',
    },
  },
}

const en: Translations = enFull

const ptBR: Translations = withFallback(
  {
    sections: { main: 'Principal', tools: 'Ferramentas', account: 'Conta' },
    dashboard: 'Painel',
    clients: 'Clientes',
    pipeline: 'Processos',
    candidates: 'Candidatos',
    talentPool: 'Banco de Talentos',
    vacancies: 'Vagas',
    interviews: 'Entrevistas',
    jobProfiles: 'Perfis de Cargo',
    templates: 'Modelos',
    integrations: 'Integrações',
    reports: 'Relatórios',
    settings: 'Configurações',
    logout: 'Sair',
    admin: 'Painel Admin',
  },
  {
    dashboard: 'Painel',
    pipeline: 'Pipeline de Recrutamento',
    vacancies: 'Gestão de Vagas',
    candidates: 'Candidatos',
    interviews: 'Entrevistas',
    settings: 'Configurações',
    talentPool: 'Banco de Talentos',
    jobProfiles: 'Perfis de Cargo',
    templates: 'Modelos',
    integrations: 'Integrações',
    reports: 'Relatórios',
    clients: 'Clientes',
    admin: 'Administração',
  }
)

const ptPT: Translations = withFallback(
  {
    sections: { main: 'Principal', tools: 'Ferramentas', account: 'Conta' },
    dashboard: 'Painel',
    clients: 'Clientes',
    pipeline: 'Processos',
    candidates: 'Candidatos',
    talentPool: 'Banco de Talentos',
    vacancies: 'Vagas',
    interviews: 'Entrevistas',
    jobProfiles: 'Perfis de Cargo',
    templates: 'Modelos',
    integrations: 'Integrações',
    reports: 'Relatórios',
    settings: 'Definições',
    logout: 'Terminar sessão',
    admin: 'Painel Admin',
  },
  {
    dashboard: 'Painel',
    pipeline: 'Pipeline de Recrutamento',
    vacancies: 'Gestão de Vagas',
    candidates: 'Candidatos',
    interviews: 'Entrevistas',
    settings: 'Definições',
    talentPool: 'Banco de Talentos',
    jobProfiles: 'Perfis de Cargo',
    templates: 'Modelos',
    integrations: 'Integrações',
    reports: 'Relatórios',
    clients: 'Clientes',
    admin: 'Administração',
  }
)

const fr: Translations = withFallback(
  {
    sections: { main: 'Principal', tools: 'Outils', account: 'Compte' },
    dashboard: 'Tableau de bord',
    clients: 'Clients',
    pipeline: 'Pipeline',
    candidates: 'Candidats',
    talentPool: 'Vivier de talents',
    vacancies: 'Offres d\'emploi',
    interviews: 'Entretiens',
    jobProfiles: 'Profils de poste',
    templates: 'Modèles',
    integrations: 'Intégrations',
    reports: 'Rapports',
    settings: 'Paramètres',
    logout: 'Se déconnecter',
    admin: 'Panneau admin',
  },
  {
    dashboard: 'Tableau de bord',
    pipeline: 'Pipeline de recrutement',
    vacancies: 'Gestion des offres',
    candidates: 'Candidats',
    interviews: 'Entretiens',
    settings: 'Paramètres',
    talentPool: 'Vivier de talents',
    jobProfiles: 'Profils de poste',
    templates: 'Modèles',
    integrations: 'Intégrations',
    reports: 'Rapports',
    clients: 'Clients',
    admin: 'Administration',
  }
)

const de: Translations = withFallback(
  {
    sections: { main: 'Hauptmenü', tools: 'Werkzeuge', account: 'Konto' },
    dashboard: 'Dashboard',
    clients: 'Kunden',
    pipeline: 'Pipeline',
    candidates: 'Kandidaten',
    talentPool: 'Talentpool',
    vacancies: 'Stellenangebote',
    interviews: 'Vorstellungsgespräche',
    jobProfiles: 'Stellenprofile',
    templates: 'Vorlagen',
    integrations: 'Integrationen',
    reports: 'Berichte',
    settings: 'Einstellungen',
    logout: 'Abmelden',
    admin: 'Admin-Panel',
  },
  {
    dashboard: 'Dashboard',
    pipeline: 'Rekrutierungspipeline',
    vacancies: 'Stellenverwaltung',
    candidates: 'Kandidaten',
    interviews: 'Vorstellungsgespräche',
    settings: 'Einstellungen',
    talentPool: 'Talentpool',
    jobProfiles: 'Stellenprofile',
    templates: 'Vorlagen',
    integrations: 'Integrationen',
    reports: 'Berichte',
    clients: 'Kunden',
    admin: 'Administration',
  }
)

const it: Translations = withFallback(
  {
    sections: { main: 'Principale', tools: 'Strumenti', account: 'Account' },
    dashboard: 'Dashboard',
    clients: 'Clienti',
    pipeline: 'Pipeline',
    candidates: 'Candidati',
    talentPool: 'Pool di talenti',
    vacancies: 'Offerte di lavoro',
    interviews: 'Colloqui',
    jobProfiles: 'Profili di lavoro',
    templates: 'Modelli',
    integrations: 'Integrazioni',
    reports: 'Report',
    settings: 'Impostazioni',
    logout: 'Esci',
    admin: 'Pannello Admin',
  },
  {
    dashboard: 'Dashboard',
    pipeline: 'Pipeline di reclutamento',
    vacancies: 'Gestione offerte',
    candidates: 'Candidati',
    interviews: 'Colloqui',
    settings: 'Impostazioni',
    talentPool: 'Pool di talenti',
    jobProfiles: 'Profili di lavoro',
    templates: 'Modelli',
    integrations: 'Integrazioni',
    reports: 'Report',
    clients: 'Clienti',
    admin: 'Amministrazione',
  }
)

const nl: Translations = withFallback(
  {
    sections: { main: 'Hoofd', tools: 'Gereedschap', account: 'Account' },
    dashboard: 'Dashboard',
    clients: 'Klanten',
    pipeline: 'Pijplijn',
    candidates: 'Kandidaten',
    talentPool: 'Talentenpool',
    vacancies: 'Vacatures',
    interviews: 'Interviews',
    jobProfiles: 'Functieprofiel',
    templates: 'Sjablonen',
    integrations: 'Integraties',
    reports: 'Rapporten',
    settings: 'Instellingen',
    logout: 'Uitloggen',
    admin: 'Beheerpaneel',
  },
  {
    dashboard: 'Dashboard',
    pipeline: 'Wervingspijplijn',
    vacancies: 'Vacaturebeheer',
    candidates: 'Kandidaten',
    interviews: 'Interviews',
    settings: 'Instellingen',
    talentPool: 'Talentenpool',
    jobProfiles: 'Functieprofielen',
    templates: 'Sjablonen',
    integrations: 'Integraties',
    reports: 'Rapporten',
    clients: 'Klanten',
    admin: 'Beheer',
  }
)

const ru: Translations = withFallback(
  {
    sections: { main: 'Главное', tools: 'Инструменты', account: 'Аккаунт' },
    dashboard: 'Дашборд',
    clients: 'Клиенты',
    pipeline: 'Воронка',
    candidates: 'Кандидаты',
    talentPool: 'Банк талантов',
    vacancies: 'Вакансии',
    interviews: 'Интервью',
    jobProfiles: 'Профили должностей',
    templates: 'Шаблоны',
    integrations: 'Интеграции',
    reports: 'Отчёты',
    settings: 'Настройки',
    logout: 'Выйти',
    admin: 'Панель администратора',
  },
  {
    dashboard: 'Дашборд',
    pipeline: 'Воронка найма',
    vacancies: 'Управление вакансиями',
    candidates: 'Кандидаты',
    interviews: 'Интервью',
    settings: 'Настройки',
    talentPool: 'Банк талантов',
    jobProfiles: 'Профили должностей',
    templates: 'Шаблоны',
    integrations: 'Интеграции',
    reports: 'Отчёты',
    clients: 'Клиенты',
    admin: 'Администрирование',
  }
)

const zhCN: Translations = withFallback(
  {
    sections: { main: '主要', tools: '工具', account: '账户' },
    dashboard: '仪表盘',
    clients: '客户',
    pipeline: '招聘流程',
    candidates: '候选人',
    talentPool: '人才库',
    vacancies: '职位',
    interviews: '面试',
    jobProfiles: '职位档案',
    templates: '模板',
    integrations: '集成',
    reports: '报告',
    settings: '设置',
    logout: '退出登录',
    admin: '管理面板',
  },
  {
    dashboard: '仪表盘',
    pipeline: '招聘流程',
    vacancies: '职位管理',
    candidates: '候选人',
    interviews: '面试',
    settings: '设置',
    talentPool: '人才库',
    jobProfiles: '职位档案',
    templates: '模板',
    integrations: '集成',
    reports: '报告',
    clients: '客户',
    admin: '管理',
  }
)

const zhTW: Translations = withFallback(
  {
    sections: { main: '主要', tools: '工具', account: '帳戶' },
    dashboard: '儀表板',
    clients: '客戶',
    pipeline: '招募流程',
    candidates: '候選人',
    talentPool: '人才庫',
    vacancies: '職缺',
    interviews: '面試',
    jobProfiles: '職位檔案',
    templates: '範本',
    integrations: '整合',
    reports: '報表',
    settings: '設定',
    logout: '登出',
    admin: '管理面板',
  },
  {
    dashboard: '儀表板',
    pipeline: '招募流程',
    vacancies: '職缺管理',
    candidates: '候選人',
    interviews: '面試',
    settings: '設定',
    talentPool: '人才庫',
    jobProfiles: '職位檔案',
    templates: '範本',
    integrations: '整合',
    reports: '報表',
    clients: '客戶',
    admin: '管理',
  }
)

const ja: Translations = withFallback(
  {
    sections: { main: 'メイン', tools: 'ツール', account: 'アカウント' },
    dashboard: 'ダッシュボード',
    clients: 'クライアント',
    pipeline: '採用パイプライン',
    candidates: '候補者',
    talentPool: '人材プール',
    vacancies: '求人',
    interviews: '面接',
    jobProfiles: '職務プロファイル',
    templates: 'テンプレート',
    integrations: '連携',
    reports: 'レポート',
    settings: '設定',
    logout: 'ログアウト',
    admin: '管理パネル',
  },
  {
    dashboard: 'ダッシュボード',
    pipeline: '採用パイプライン',
    vacancies: '求人管理',
    candidates: '候補者',
    interviews: '面接',
    settings: '設定',
    talentPool: '人材プール',
    jobProfiles: '職務プロファイル',
    templates: 'テンプレート',
    integrations: '連携',
    reports: 'レポート',
    clients: 'クライアント',
    admin: '管理',
  }
)

const ko: Translations = withFallback(
  {
    sections: { main: '메인', tools: '도구', account: '계정' },
    dashboard: '대시보드',
    clients: '클라이언트',
    pipeline: '채용 파이프라인',
    candidates: '후보자',
    talentPool: '인재 풀',
    vacancies: '채용 공고',
    interviews: '인터뷰',
    jobProfiles: '직무 프로필',
    templates: '템플릿',
    integrations: '연동',
    reports: '보고서',
    settings: '설정',
    logout: '로그아웃',
    admin: '관리자 패널',
  },
  {
    dashboard: '대시보드',
    pipeline: '채용 파이프라인',
    vacancies: '채용 공고 관리',
    candidates: '후보자',
    interviews: '인터뷰',
    settings: '설정',
    talentPool: '인재 풀',
    jobProfiles: '직무 프로필',
    templates: '템플릿',
    integrations: '연동',
    reports: '보고서',
    clients: '클라이언트',
    admin: '관리',
  }
)

const ar: Translations = withFallback(
  {
    sections: { main: 'الرئيسية', tools: 'الأدوات', account: 'الحساب' },
    dashboard: 'لوحة التحكم',
    clients: 'العملاء',
    pipeline: 'مسار التوظيف',
    candidates: 'المرشحون',
    talentPool: 'بنك المواهب',
    vacancies: 'الوظائف',
    interviews: 'المقابلات',
    jobProfiles: 'ملفات الوظائف',
    templates: 'القوالب',
    integrations: 'التكاملات',
    reports: 'التقارير',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    admin: 'لوحة الإدارة',
  },
  {
    dashboard: 'لوحة التحكم',
    pipeline: 'مسار التوظيف',
    vacancies: 'إدارة الوظائف',
    candidates: 'المرشحون',
    interviews: 'المقابلات',
    settings: 'الإعدادات',
    talentPool: 'بنك المواهب',
    jobProfiles: 'ملفات الوظائف',
    templates: 'القوالب',
    integrations: 'التكاملات',
    reports: 'التقارير',
    clients: 'العملاء',
    admin: 'الإدارة',
  }
)

const tr: Translations = withFallback(
  {
    sections: { main: 'Ana Menü', tools: 'Araçlar', account: 'Hesap' },
    dashboard: 'Panel',
    clients: 'Müşteriler',
    pipeline: 'İşe Alım Süreci',
    candidates: 'Adaylar',
    talentPool: 'Yetenek Havuzu',
    vacancies: 'İlanlar',
    interviews: 'Mülakatlar',
    jobProfiles: 'İş Profilleri',
    templates: 'Şablonlar',
    integrations: 'Entegrasyonlar',
    reports: 'Raporlar',
    settings: 'Ayarlar',
    logout: 'Çıkış Yap',
    admin: 'Admin Paneli',
  },
  {
    dashboard: 'Panel',
    pipeline: 'İşe Alım Süreci',
    vacancies: 'İlan Yönetimi',
    candidates: 'Adaylar',
    interviews: 'Mülakatlar',
    settings: 'Ayarlar',
    talentPool: 'Yetenek Havuzu',
    jobProfiles: 'İş Profilleri',
    templates: 'Şablonlar',
    integrations: 'Entegrasyonlar',
    reports: 'Raporlar',
    clients: 'Müşteriler',
    admin: 'Yönetim',
  }
)

const pl: Translations = withFallback(
  {
    sections: { main: 'Główne', tools: 'Narzędzia', account: 'Konto' },
    dashboard: 'Pulpit',
    clients: 'Klienci',
    pipeline: 'Lejek rekrutacyjny',
    candidates: 'Kandydaci',
    talentPool: 'Pula talentów',
    vacancies: 'Oferty pracy',
    interviews: 'Rozmowy kwalifikacyjne',
    jobProfiles: 'Profile stanowisk',
    templates: 'Szablony',
    integrations: 'Integracje',
    reports: 'Raporty',
    settings: 'Ustawienia',
    logout: 'Wyloguj',
    admin: 'Panel admina',
  },
  {
    dashboard: 'Pulpit',
    pipeline: 'Lejek rekrutacyjny',
    vacancies: 'Zarządzanie ofertami',
    candidates: 'Kandydaci',
    interviews: 'Rozmowy kwalifikacyjne',
    settings: 'Ustawienia',
    talentPool: 'Pula talentów',
    jobProfiles: 'Profile stanowisk',
    templates: 'Szablony',
    integrations: 'Integracje',
    reports: 'Raporty',
    clients: 'Klienci',
    admin: 'Administracja',
  }
)

const cs: Translations = withFallback(
  {
    sections: { main: 'Hlavní', tools: 'Nástroje', account: 'Účet' },
    dashboard: 'Přehled',
    clients: 'Klienti',
    pipeline: 'Náborový pipeline',
    candidates: 'Kandidáti',
    talentPool: 'Databáze talentů',
    vacancies: 'Volná místa',
    interviews: 'Pohovory',
    jobProfiles: 'Profily pozic',
    templates: 'Šablony',
    integrations: 'Integrace',
    reports: 'Přehledy',
    settings: 'Nastavení',
    logout: 'Odhlásit se',
    admin: 'Admin panel',
  },
  {
    dashboard: 'Přehled',
    pipeline: 'Náborový pipeline',
    vacancies: 'Správa volných míst',
    candidates: 'Kandidáti',
    interviews: 'Pohovory',
    settings: 'Nastavení',
    talentPool: 'Databáze talentů',
    jobProfiles: 'Profily pozic',
    templates: 'Šablony',
    integrations: 'Integrace',
    reports: 'Přehledy',
    clients: 'Klienti',
    admin: 'Administrace',
  }
)

const sv: Translations = withFallback(
  {
    sections: { main: 'Huvudmeny', tools: 'Verktyg', account: 'Konto' },
    dashboard: 'Instrumentpanel',
    clients: 'Kunder',
    pipeline: 'Rekryteringspipeline',
    candidates: 'Kandidater',
    talentPool: 'Talangpool',
    vacancies: 'Lediga tjänster',
    interviews: 'Intervjuer',
    jobProfiles: 'Jobbprofiler',
    templates: 'Mallar',
    integrations: 'Integrationer',
    reports: 'Rapporter',
    settings: 'Inställningar',
    logout: 'Logga ut',
    admin: 'Adminpanel',
  },
  {
    dashboard: 'Instrumentpanel',
    pipeline: 'Rekryteringspipeline',
    vacancies: 'Hantering av tjänster',
    candidates: 'Kandidater',
    interviews: 'Intervjuer',
    settings: 'Inställningar',
    talentPool: 'Talangpool',
    jobProfiles: 'Jobbprofiler',
    templates: 'Mallar',
    integrations: 'Integrationer',
    reports: 'Rapporter',
    clients: 'Kunder',
    admin: 'Administration',
  }
)

const da: Translations = withFallback(
  {
    sections: { main: 'Hoved', tools: 'Værktøjer', account: 'Konto' },
    dashboard: 'Oversigt',
    clients: 'Kunder',
    pipeline: 'Rekrutteringspipeline',
    candidates: 'Kandidater',
    talentPool: 'Talentpulje',
    vacancies: 'Ledige stillinger',
    interviews: 'Samtaler',
    jobProfiles: 'Jobprofiler',
    templates: 'Skabeloner',
    integrations: 'Integrationer',
    reports: 'Rapporter',
    settings: 'Indstillinger',
    logout: 'Log ud',
    admin: 'Admin panel',
  },
  {
    dashboard: 'Oversigt',
    pipeline: 'Rekrutteringspipeline',
    vacancies: 'Stillingsadministration',
    candidates: 'Kandidater',
    interviews: 'Samtaler',
    settings: 'Indstillinger',
    talentPool: 'Talentpulje',
    jobProfiles: 'Jobprofiler',
    templates: 'Skabeloner',
    integrations: 'Integrationer',
    reports: 'Rapporter',
    clients: 'Kunder',
    admin: 'Administration',
  }
)

const fi: Translations = withFallback(
  {
    sections: { main: 'Päävalikko', tools: 'Työkalut', account: 'Tili' },
    dashboard: 'Kojelauta',
    clients: 'Asiakkaat',
    pipeline: 'Rekrytointiputki',
    candidates: 'Ehdokkaat',
    talentPool: 'Osaamisvaranto',
    vacancies: 'Avoimet paikat',
    interviews: 'Haastattelut',
    jobProfiles: 'Työnkuvat',
    templates: 'Mallipohjat',
    integrations: 'Integraatiot',
    reports: 'Raportit',
    settings: 'Asetukset',
    logout: 'Kirjaudu ulos',
    admin: 'Hallintapaneeli',
  },
  {
    dashboard: 'Kojelauta',
    pipeline: 'Rekrytointiputki',
    vacancies: 'Avointen paikkojen hallinta',
    candidates: 'Ehdokkaat',
    interviews: 'Haastattelut',
    settings: 'Asetukset',
    talentPool: 'Osaamisvaranto',
    jobProfiles: 'Työnkuvat',
    templates: 'Mallipohjat',
    integrations: 'Integraatiot',
    reports: 'Raportit',
    clients: 'Asiakkaat',
    admin: 'Hallinto',
  }
)

const nb: Translations = withFallback(
  {
    sections: { main: 'Hoved', tools: 'Verktøy', account: 'Konto' },
    dashboard: 'Oversikt',
    clients: 'Kunder',
    pipeline: 'Rekrutteringspipeline',
    candidates: 'Kandidater',
    talentPool: 'Talentbase',
    vacancies: 'Ledige stillinger',
    interviews: 'Intervjuer',
    jobProfiles: 'Stillingsprofiler',
    templates: 'Maler',
    integrations: 'Integrasjoner',
    reports: 'Rapporter',
    settings: 'Innstillinger',
    logout: 'Logg ut',
    admin: 'Adminpanel',
  },
  {
    dashboard: 'Oversikt',
    pipeline: 'Rekrutteringspipeline',
    vacancies: 'Stillingsadministrasjon',
    candidates: 'Kandidater',
    interviews: 'Intervjuer',
    settings: 'Innstillinger',
    talentPool: 'Talentbase',
    jobProfiles: 'Stillingsprofiler',
    templates: 'Maler',
    integrations: 'Integrasjoner',
    reports: 'Rapporter',
    clients: 'Kunder',
    admin: 'Administrasjon',
  }
)

const uk: Translations = withFallback(
  {
    sections: { main: 'Головне', tools: 'Інструменти', account: 'Акаунт' },
    dashboard: 'Дашборд',
    clients: 'Клієнти',
    pipeline: 'Воронка набору',
    candidates: 'Кандидати',
    talentPool: 'Банк талантів',
    vacancies: 'Вакансії',
    interviews: 'Співбесіди',
    jobProfiles: 'Профілі посад',
    templates: 'Шаблони',
    integrations: 'Інтеграції',
    reports: 'Звіти',
    settings: 'Налаштування',
    logout: 'Вийти',
    admin: 'Панель адміна',
  },
  {
    dashboard: 'Дашборд',
    pipeline: 'Воронка набору',
    vacancies: 'Управління вакансіями',
    candidates: 'Кандидати',
    interviews: 'Співбесіди',
    settings: 'Налаштування',
    talentPool: 'Банк талантів',
    jobProfiles: 'Профілі посад',
    templates: 'Шаблони',
    integrations: 'Інтеграції',
    reports: 'Звіти',
    clients: 'Клієнти',
    admin: 'Адміністрування',
  }
)

const id: Translations = withFallback(
  {
    sections: { main: 'Utama', tools: 'Alat', account: 'Akun' },
    dashboard: 'Dasbor',
    clients: 'Klien',
    pipeline: 'Alur Rekrutmen',
    candidates: 'Kandidat',
    talentPool: 'Kumpulan Bakat',
    vacancies: 'Lowongan',
    interviews: 'Wawancara',
    jobProfiles: 'Profil Jabatan',
    templates: 'Template',
    integrations: 'Integrasi',
    reports: 'Laporan',
    settings: 'Pengaturan',
    logout: 'Keluar',
    admin: 'Panel Admin',
  },
  {
    dashboard: 'Dasbor',
    pipeline: 'Alur Rekrutmen',
    vacancies: 'Manajemen Lowongan',
    candidates: 'Kandidat',
    interviews: 'Wawancara',
    settings: 'Pengaturan',
    talentPool: 'Kumpulan Bakat',
    jobProfiles: 'Profil Jabatan',
    templates: 'Template',
    integrations: 'Integrasi',
    reports: 'Laporan',
    clients: 'Klien',
    admin: 'Administrasi',
  }
)

const ms: Translations = withFallback(
  {
    sections: { main: 'Utama', tools: 'Alat', account: 'Akaun' },
    dashboard: 'Papan Pemuka',
    clients: 'Klien',
    pipeline: 'Saluran Pengambilan',
    candidates: 'Calon',
    talentPool: 'Kumpulan Bakat',
    vacancies: 'Kekosongan',
    interviews: 'Temuduga',
    jobProfiles: 'Profil Kerja',
    templates: 'Templat',
    integrations: 'Integrasi',
    reports: 'Laporan',
    settings: 'Tetapan',
    logout: 'Log Keluar',
    admin: 'Panel Admin',
  },
  {
    dashboard: 'Papan Pemuka',
    pipeline: 'Saluran Pengambilan',
    vacancies: 'Pengurusan Kekosongan',
    candidates: 'Calon',
    interviews: 'Temuduga',
    settings: 'Tetapan',
    talentPool: 'Kumpulan Bakat',
    jobProfiles: 'Profil Kerja',
    templates: 'Templat',
    integrations: 'Integrasi',
    reports: 'Laporan',
    clients: 'Klien',
    admin: 'Pentadbiran',
  }
)

const th: Translations = withFallback(
  {
    sections: { main: 'หลัก', tools: 'เครื่องมือ', account: 'บัญชี' },
    dashboard: 'แดชบอร์ด',
    clients: 'ลูกค้า',
    pipeline: 'ขั้นตอนการสรรหา',
    candidates: 'ผู้สมัคร',
    talentPool: 'กลุ่มผู้มีความสามารถ',
    vacancies: 'ตำแหน่งงาน',
    interviews: 'การสัมภาษณ์',
    jobProfiles: 'โปรไฟล์งาน',
    templates: 'แม่แบบ',
    integrations: 'การเชื่อมต่อ',
    reports: 'รายงาน',
    settings: 'การตั้งค่า',
    logout: 'ออกจากระบบ',
    admin: 'แผงผู้ดูแล',
  },
  {
    dashboard: 'แดชบอร์ด',
    pipeline: 'ขั้นตอนการสรรหา',
    vacancies: 'การจัดการตำแหน่งงาน',
    candidates: 'ผู้สมัคร',
    interviews: 'การสัมภาษณ์',
    settings: 'การตั้งค่า',
    talentPool: 'กลุ่มผู้มีความสามารถ',
    jobProfiles: 'โปรไฟล์งาน',
    templates: 'แม่แบบ',
    integrations: 'การเชื่อมต่อ',
    reports: 'รายงาน',
    clients: 'ลูกค้า',
    admin: 'การบริหาร',
  }
)

const vi: Translations = withFallback(
  {
    sections: { main: 'Chính', tools: 'Công cụ', account: 'Tài khoản' },
    dashboard: 'Bảng điều khiển',
    clients: 'Khách hàng',
    pipeline: 'Quy trình tuyển dụng',
    candidates: 'Ứng viên',
    talentPool: 'Kho nhân tài',
    vacancies: 'Tuyển dụng',
    interviews: 'Phỏng vấn',
    jobProfiles: 'Hồ sơ công việc',
    templates: 'Mẫu',
    integrations: 'Tích hợp',
    reports: 'Báo cáo',
    settings: 'Cài đặt',
    logout: 'Đăng xuất',
    admin: 'Bảng quản trị',
  },
  {
    dashboard: 'Bảng điều khiển',
    pipeline: 'Quy trình tuyển dụng',
    vacancies: 'Quản lý tuyển dụng',
    candidates: 'Ứng viên',
    interviews: 'Phỏng vấn',
    settings: 'Cài đặt',
    talentPool: 'Kho nhân tài',
    jobProfiles: 'Hồ sơ công việc',
    templates: 'Mẫu',
    integrations: 'Tích hợp',
    reports: 'Báo cáo',
    clients: 'Khách hàng',
    admin: 'Quản trị',
  }
)

const hi: Translations = withFallback(
  {
    sections: { main: 'मुख्य', tools: 'उपकरण', account: 'खाता' },
    dashboard: 'डैशबोर्ड',
    clients: 'ग्राहक',
    pipeline: 'भर्ती प्रक्रिया',
    candidates: 'उम्मीदवार',
    talentPool: 'प्रतिभा पूल',
    vacancies: 'रिक्तियां',
    interviews: 'साक्षात्कार',
    jobProfiles: 'नौकरी प्रोफाइल',
    templates: 'टेम्पलेट',
    integrations: 'एकीकरण',
    reports: 'रिपोर्ट',
    settings: 'सेटिंग',
    logout: 'लॉग आउट',
    admin: 'व्यवस्थापक पैनल',
  },
  {
    dashboard: 'डैशबोर्ड',
    pipeline: 'भर्ती प्रक्रिया',
    vacancies: 'रिक्ति प्रबंधन',
    candidates: 'उम्मीदवार',
    interviews: 'साक्षात्कार',
    settings: 'सेटिंग',
    talentPool: 'प्रतिभा पूल',
    jobProfiles: 'नौकरी प्रोफाइल',
    templates: 'टेम्पलेट',
    integrations: 'एकीकरण',
    reports: 'रिपोर्ट',
    clients: 'ग्राहक',
    admin: 'प्रशासन',
  }
)

const he: Translations = withFallback(
  {
    sections: { main: 'ראשי', tools: 'כלים', account: 'חשבון' },
    dashboard: 'לוח בקרה',
    clients: 'לקוחות',
    pipeline: 'תהליך גיוס',
    candidates: 'מועמדים',
    talentPool: 'בנק כישרונות',
    vacancies: 'משרות',
    interviews: 'ראיונות',
    jobProfiles: 'פרופילי תפקיד',
    templates: 'תבניות',
    integrations: 'אינטגרציות',
    reports: 'דוחות',
    settings: 'הגדרות',
    logout: 'התנתקות',
    admin: 'לוח ניהול',
  },
  {
    dashboard: 'לוח בקרה',
    pipeline: 'תהליך גיוס',
    vacancies: 'ניהול משרות',
    candidates: 'מועמדים',
    interviews: 'ראיונות',
    settings: 'הגדרות',
    talentPool: 'בנק כישרונות',
    jobProfiles: 'פרופילי תפקיד',
    templates: 'תבניות',
    integrations: 'אינטגרציות',
    reports: 'דוחות',
    clients: 'לקוחות',
    admin: 'ניהול',
  }
)

const ro: Translations = withFallback(
  {
    sections: { main: 'Principal', tools: 'Instrumente', account: 'Cont' },
    dashboard: 'Panou de control',
    clients: 'Clienți',
    pipeline: 'Pipeline de recrutare',
    candidates: 'Candidați',
    talentPool: 'Pool de talente',
    vacancies: 'Locuri de muncă',
    interviews: 'Interviuri',
    jobProfiles: 'Profile de post',
    templates: 'Șabloane',
    integrations: 'Integrări',
    reports: 'Rapoarte',
    settings: 'Setări',
    logout: 'Deconectare',
    admin: 'Panou admin',
  },
  {
    dashboard: 'Panou de control',
    pipeline: 'Pipeline de recrutare',
    vacancies: 'Gestionarea locurilor de muncă',
    candidates: 'Candidați',
    interviews: 'Interviuri',
    settings: 'Setări',
    talentPool: 'Pool de talente',
    jobProfiles: 'Profile de post',
    templates: 'Șabloane',
    integrations: 'Integrări',
    reports: 'Rapoarte',
    clients: 'Clienți',
    admin: 'Administrare',
  }
)

const hu: Translations = withFallback(
  {
    sections: { main: 'Főmenü', tools: 'Eszközök', account: 'Fiók' },
    dashboard: 'Irányítópult',
    clients: 'Ügyfelek',
    pipeline: 'Toborzási folyamat',
    candidates: 'Jelöltek',
    talentPool: 'Tehetségtár',
    vacancies: 'Állásajánlatok',
    interviews: 'Interjúk',
    jobProfiles: 'Munkaköri profilok',
    templates: 'Sablonok',
    integrations: 'Integrációk',
    reports: 'Jelentések',
    settings: 'Beállítások',
    logout: 'Kijelentkezés',
    admin: 'Admin panel',
  },
  {
    dashboard: 'Irányítópult',
    pipeline: 'Toborzási folyamat',
    vacancies: 'Állásajánlatok kezelése',
    candidates: 'Jelöltek',
    interviews: 'Interjúk',
    settings: 'Beállítások',
    talentPool: 'Tehetségtár',
    jobProfiles: 'Munkaköri profilok',
    templates: 'Sablonok',
    integrations: 'Integrációk',
    reports: 'Jelentések',
    clients: 'Ügyfelek',
    admin: 'Adminisztráció',
  }
)

const sk: Translations = withFallback(
  {
    sections: { main: 'Hlavné', tools: 'Nástroje', account: 'Účet' },
    dashboard: 'Prehľad',
    clients: 'Klienti',
    pipeline: 'Náborový pipeline',
    candidates: 'Kandidáti',
    talentPool: 'Databáza talentov',
    vacancies: 'Pracovné miesta',
    interviews: 'Pohovory',
    jobProfiles: 'Profily pozícií',
    templates: 'Šablóny',
    integrations: 'Integrácie',
    reports: 'Prehľady',
    settings: 'Nastavenia',
    logout: 'Odhlásiť sa',
    admin: 'Admin panel',
  },
  {
    dashboard: 'Prehľad',
    pipeline: 'Náborový pipeline',
    vacancies: 'Správa pracovných miest',
    candidates: 'Kandidáti',
    interviews: 'Pohovory',
    settings: 'Nastavenia',
    talentPool: 'Databáza talentov',
    jobProfiles: 'Profily pozícií',
    templates: 'Šablóny',
    integrations: 'Integrácie',
    reports: 'Prehľady',
    clients: 'Klienti',
    admin: 'Administrácia',
  }
)

const bg: Translations = withFallback(
  {
    sections: { main: 'Главно', tools: 'Инструменти', account: 'Акаунт' },
    dashboard: 'Табло',
    clients: 'Клиенти',
    pipeline: 'Процес на наемане',
    candidates: 'Кандидати',
    talentPool: 'Банка от таланти',
    vacancies: 'Свободни позиции',
    interviews: 'Интервюта',
    jobProfiles: 'Профили на длъжности',
    templates: 'Шаблони',
    integrations: 'Интеграции',
    reports: 'Доклади',
    settings: 'Настройки',
    logout: 'Изход',
    admin: 'Админ панел',
  },
  {
    dashboard: 'Табло',
    pipeline: 'Процес на наемане',
    vacancies: 'Управление на позиции',
    candidates: 'Кандидати',
    interviews: 'Интервюта',
    settings: 'Настройки',
    talentPool: 'Банка от таланти',
    jobProfiles: 'Профили на длъжности',
    templates: 'Шаблони',
    integrations: 'Интеграции',
    reports: 'Доклади',
    clients: 'Клиенти',
    admin: 'Администрация',
  }
)

const hr: Translations = withFallback(
  {
    sections: { main: 'Glavno', tools: 'Alati', account: 'Račun' },
    dashboard: 'Nadzorna ploča',
    clients: 'Klijenti',
    pipeline: 'Pipeline zapošljavanja',
    candidates: 'Kandidati',
    talentPool: 'Baza talenata',
    vacancies: 'Oglasi za posao',
    interviews: 'Razgovori za posao',
    jobProfiles: 'Profili radnih mjesta',
    templates: 'Predlošci',
    integrations: 'Integracije',
    reports: 'Izvješća',
    settings: 'Postavke',
    logout: 'Odjava',
    admin: 'Admin panel',
  },
  {
    dashboard: 'Nadzorna ploča',
    pipeline: 'Pipeline zapošljavanja',
    vacancies: 'Upravljanje oglasima',
    candidates: 'Kandidati',
    interviews: 'Razgovori za posao',
    settings: 'Postavke',
    talentPool: 'Baza talenata',
    jobProfiles: 'Profili radnih mjesta',
    templates: 'Predlošci',
    integrations: 'Integracije',
    reports: 'Izvješća',
    clients: 'Klijenti',
    admin: 'Administracija',
  }
)

const ca: Translations = withFallback(
  {
    sections: { main: 'Principal', tools: 'Eines', account: 'Compte' },
    dashboard: 'Tauler',
    clients: 'Clients',
    pipeline: 'Pipeline de reclutament',
    candidates: 'Candidats',
    talentPool: 'Borsa de talents',
    vacancies: 'Ofertes de treball',
    interviews: 'Entrevistes',
    jobProfiles: 'Perfils de lloc',
    templates: 'Plantilles',
    integrations: 'Integracions',
    reports: 'Informes',
    settings: 'Configuració',
    logout: 'Tancar sessió',
    admin: 'Tauler d\'administració',
  },
  {
    dashboard: 'Tauler',
    pipeline: 'Pipeline de reclutament',
    vacancies: 'Gestió d\'ofertes',
    candidates: 'Candidats',
    interviews: 'Entrevistes',
    settings: 'Configuració',
    talentPool: 'Borsa de talents',
    jobProfiles: 'Perfils de lloc',
    templates: 'Plantilles',
    integrations: 'Integracions',
    reports: 'Informes',
    clients: 'Clients',
    admin: 'Administració',
  }
)

const eu: Translations = withFallback(
  {
    sections: { main: 'Nagusia', tools: 'Tresnak', account: 'Kontua' },
    dashboard: 'Aginte-panela',
    clients: 'Bezeroak',
    pipeline: 'Hautaketa-prozesua',
    candidates: 'Hautagaiak',
    talentPool: 'Talentu-bankua',
    vacancies: 'Lan-eskaintzak',
    interviews: 'Elkarrizketak',
    jobProfiles: 'Lanpostu-profilak',
    templates: 'Txantiloiak',
    integrations: 'Integrazioak',
    reports: 'Txostenak',
    settings: 'Ezarpenak',
    logout: 'Amaitu saioa',
    admin: 'Administrazio-panela',
  },
  {
    dashboard: 'Aginte-panela',
    pipeline: 'Hautaketa-prozesua',
    vacancies: 'Lan-eskaintzen kudeaketa',
    candidates: 'Hautagaiak',
    interviews: 'Elkarrizketak',
    settings: 'Ezarpenak',
    talentPool: 'Talentu-bankua',
    jobProfiles: 'Lanpostu-profilak',
    templates: 'Txantiloiak',
    integrations: 'Integrazioak',
    reports: 'Txostenak',
    clients: 'Bezeroak',
    admin: 'Administrazioa',
  }
)

// ─── Translations map ─────────────────────────────────────────────────────────
export const translations: Record<LangCode, Translations> = {
  es,
  en,
  'pt-BR': ptBR,
  'pt-PT': ptPT,
  fr,
  de,
  it,
  nl,
  ru,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  ja,
  ko,
  ar,
  tr,
  pl,
  cs,
  sv,
  da,
  fi,
  nb,
  uk,
  id,
  ms,
  th,
  vi,
  hi,
  he,
  ro,
  hu,
  sk,
  bg,
  hr,
  ca,
  eu,
}
