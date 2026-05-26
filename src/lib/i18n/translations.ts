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
