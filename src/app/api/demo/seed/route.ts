import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const reset = request.nextUrl.searchParams.get('reset') === 'true'

  // 1. Validate authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ ok: false, message: 'No autenticado' }, { status: 401 })
  }

  // 2. Get tenant_id from profiles — fall back to user.id if profile row doesn't exist yet
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('[seed] profiles lookup error:', profileError.message)
  }

  // If profile doesn't exist, use user.id directly as tenant_id (matches UserContext behaviour)
  const tenant_id: string = profile?.tenant_id ?? user.id

  // 3. Check if data already exists (or reset if requested)
  const { count: existingCount } = await supabase
    .from('vacancies')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant_id)

  if (existingCount && existingCount > 0) {
    if (!reset) {
      return NextResponse.json({ ok: false, message: 'Ya tenés datos cargados' })
    }
    // Delete existing demo data for this tenant before re-seeding
    await supabase.from('interviews').delete().eq('tenant_id', tenant_id)
    await supabase.from('applications').delete().eq('tenant_id', tenant_id)
    await supabase.from('candidates').delete().eq('tenant_id', tenant_id)
    await supabase.from('vacancies').delete().eq('tenant_id', tenant_id)
  }

  // 4. Insert demo data

  // Vacancies
  const vacanciesData = [
    { title: 'Frontend Developer Senior', department: 'Tecnología', status: 'En Proceso', requirements: ['React', 'TypeScript', 'Next.js'], salary_min: 180000, salary_max: 250000, modality: 'Remoto', priority: 'high', tenant_id },
    { title: 'Product Manager', department: 'Producto', status: 'Nuevas Vacantes', requirements: ['Roadmap', 'Agile', 'SQL'], salary_min: 200000, salary_max: 280000, modality: 'Híbrido', priority: 'high', tenant_id },
    { title: 'UX/UI Designer', department: 'Diseño', status: 'Entrevistas', requirements: ['Figma', 'Prototyping', 'Research'], salary_min: 150000, salary_max: 200000, modality: 'Remoto', priority: 'medium', tenant_id },
    { title: 'Data Analyst', department: 'Datos', status: 'Oferta Enviada', requirements: ['Python', 'SQL', 'Power BI'], salary_min: 160000, salary_max: 210000, modality: 'Presencial', priority: 'medium', tenant_id },
    { title: 'DevOps Engineer', department: 'Infraestructura', status: 'Contratado', requirements: ['AWS', 'Docker', 'Kubernetes'], salary_min: 220000, salary_max: 300000, modality: 'Remoto', priority: 'low', tenant_id },
  ]

  const { data: insertedVacancies, error: vacanciesError } = await supabase
    .from('vacancies')
    .insert(vacanciesData)
    .select('id')

  if (vacanciesError || !insertedVacancies) {
    console.error('[seed] vacancies insert error:', vacanciesError?.message)
    return NextResponse.json({ ok: false, message: 'Error al insertar vacantes: ' + vacanciesError?.message }, { status: 500 })
  }

  const [frontendId, pmId, uxuiId, dataId, devopsId] = insertedVacancies.map(v => v.id)

  // Candidates
  const candidatesData = [
    { full_name: 'Valentina Rodríguez', email: 'v.rodriguez@email.com', ats_score: 92, skills: ['React', 'TypeScript', 'CSS'], source: 'LinkedIn', tenant_id },
    { full_name: 'Matías González', email: 'm.gonzalez@email.com', ats_score: 88, skills: ['React', 'Vue.js', 'Node.js'], source: 'LinkedIn', tenant_id },
    { full_name: 'Camila Fernández', email: 'c.fernandez@email.com', ats_score: 85, skills: ['Figma', 'Research', 'Prototyping'], source: 'Indeed', tenant_id },
    { full_name: 'Lucas Martínez', email: 'l.martinez@email.com', ats_score: 79, skills: ['Python', 'SQL', 'Pandas'], source: 'Referido', tenant_id },
    { full_name: 'Sofía Pérez', email: 's.perez@email.com', ats_score: 95, skills: ['AWS', 'Docker', 'CI/CD'], source: 'LinkedIn', tenant_id },
    { full_name: 'Agustín López', email: 'a.lopez@email.com', ats_score: 71, skills: ['Agile', 'Jira', 'Roadmap'], source: 'Portal web', tenant_id },
    { full_name: 'Florencia Díaz', email: 'f.diaz@email.com', ats_score: 83, skills: ['React', 'Next.js', 'GraphQL'], source: 'LinkedIn', tenant_id },
    { full_name: 'Tomás Sánchez', email: 't.sanchez@email.com', ats_score: 76, skills: ['SQL', 'Power BI', 'Excel'], source: 'Indeed', tenant_id },
    { full_name: 'Isabella Torres', email: 'i.torres@email.com', ats_score: 90, skills: ['Kubernetes', 'AWS', 'Terraform'], source: 'Referido', tenant_id },
    { full_name: 'Santiago Vargas', email: 's.vargas@email.com', ats_score: 68, skills: ['Figma', 'Illustrator', 'UX'], source: 'Portal web', tenant_id },
    { full_name: 'Martina Ruiz', email: 'm.ruiz@email.com', ats_score: 87, skills: ['TypeScript', 'React', 'Testing'], source: 'LinkedIn', tenant_id },
    { full_name: 'Joaquín Morales', email: 'j.morales@email.com', ats_score: 74, skills: ['Python', 'Tableau', 'R'], source: 'Indeed', tenant_id },
  ]

  const { data: insertedCandidates, error: candidatesError } = await supabase
    .from('candidates')
    .insert(candidatesData)
    .select('id')

  if (candidatesError || !insertedCandidates) {
    console.error('[seed] candidates insert error:', candidatesError?.message)
    return NextResponse.json({ ok: false, message: 'Error al insertar candidatos: ' + candidatesError?.message }, { status: 500 })
  }

  const [
    valentinaId, // 0
    matiasId,    // 1
    camilaId,    // 2
    lucasId,     // 3
    sofiaId,     // 4
    agustinId,   // 5
    florenciaId, // 6
    tomasId,     // 7
    isabellaId,  // 8
    santiagoId,  // 9
    martinaId,   // 10
    joaquinId,   // 11
  ] = insertedCandidates.map(c => c.id)

  // Applications
  const applicationsData = [
    // Frontend Dev: candidates 0,1,6,10
    { candidate_id: valentinaId, vacancy_id: frontendId, status: 'En Proceso', tenant_id },
    { candidate_id: matiasId, vacancy_id: frontendId, status: 'En Proceso', tenant_id },
    { candidate_id: florenciaId, vacancy_id: frontendId, status: 'En Proceso', tenant_id },
    { candidate_id: martinaId, vacancy_id: frontendId, status: 'En Proceso', tenant_id },
    // Product Manager: candidate 5
    { candidate_id: agustinId, vacancy_id: pmId, status: 'Nuevas Vacantes', tenant_id },
    // UX/UI Designer: candidates 2,9
    { candidate_id: camilaId, vacancy_id: uxuiId, status: 'Entrevistas', tenant_id },
    { candidate_id: santiagoId, vacancy_id: uxuiId, status: 'Entrevistas', tenant_id },
    // Data Analyst: candidates 3,7,11
    { candidate_id: lucasId, vacancy_id: dataId, status: 'Oferta Enviada', tenant_id },
    { candidate_id: tomasId, vacancy_id: dataId, status: 'Oferta Enviada', tenant_id },
    { candidate_id: joaquinId, vacancy_id: dataId, status: 'Oferta Enviada', tenant_id },
    // DevOps Engineer: candidates 4,8
    { candidate_id: sofiaId, vacancy_id: devopsId, status: 'Contratado', tenant_id },
    { candidate_id: isabellaId, vacancy_id: devopsId, status: 'Contratado', tenant_id },
  ]

  const { error: applicationsError } = await supabase
    .from('applications')
    .insert(applicationsData)

  if (applicationsError) {
    console.error('[seed] applications insert error:', applicationsError.message)
    return NextResponse.json({ ok: false, message: 'Error al insertar postulaciones: ' + applicationsError.message }, { status: 500 })
  }

  // Interviews
  const interviewsData = [
    {
      candidate_id: camilaId,
      vacancy_id: uxuiId,
      scheduled_at: '2026-05-20T14:00:00Z',
      type: 'Technical',
      interviewer_name: 'Ana García',
      status: 'scheduled',
      meeting_platform: 'Google Meet',
      tenant_id,
    },
    {
      candidate_id: lucasId,
      vacancy_id: dataId,
      scheduled_at: '2026-05-22T10:00:00Z',
      type: 'HR',
      interviewer_name: 'Carlos Ruiz',
      status: 'scheduled',
      meeting_platform: 'Zoom',
      tenant_id,
    },
  ]

  const { error: interviewsError } = await supabase
    .from('interviews')
    .insert(interviewsData)

  if (interviewsError) {
    console.error('[seed] interviews insert error:', interviewsError.message)
    return NextResponse.json({ ok: false, message: 'Error al insertar entrevistas: ' + interviewsError.message }, { status: 500 })
  }

  // 5. Return success
  return NextResponse.json({
    ok: true,
    message: 'Datos demo cargados correctamente',
    counts: { vacancies: 5, candidates: 12, applications: 11, interviews: 2 },
  })
}
