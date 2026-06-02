**AVISO:** Este documento es un borrador preliminar. Debe ser revisado por un abogado matriculado antes de su publicación.

# ACUERDO DE NIVEL DE SERVICIO (SERVICE LEVEL AGREEMENT — SLA)
## ConectAr Talento

**Última actualización:** 01 de junio de 2026
**Versión:** 1.0

El presente Acuerdo de Nivel de Servicio (en adelante, "el SLA") forma parte integrante de los Términos y Condiciones Generales de ConectAr Talento. En caso de conflicto entre el SLA y los Términos y Condiciones, prevalecerá el SLA respecto de los aspectos técnicos de disponibilidad del servicio.

---

### 1. ÁMBITO DE APLICACIÓN

El presente SLA aplica a todos los Usuarios de planes pagos (Starter, Pro, Business y Enterprise) de ConectAr Talento. Los Usuarios del Plan Gratuito no son beneficiarios de los compromisos y compensaciones establecidos en este SLA, aunque el Proveedor realizará esfuerzos razonables para mantener el servicio gratuito disponible.

---

### 2. DISPONIBILIDAD COMPROMETIDA

**2.1. Compromiso de disponibilidad**

ConectAr Talento se compromete a mantener la Plataforma disponible y operativa el **99% del tiempo**, calculado de manera mensual (en adelante, "el SLA de disponibilidad").

La disponibilidad mensual se calcula mediante la siguiente fórmula:

```
Disponibilidad (%) = [(Total de minutos del mes - Minutos de inactividad no programada) / Total de minutos del mes] × 100
```

**2.2. Definición de inactividad**

Se considera "inactividad" (downtime) el período durante el cual la Plataforma no está disponible para acceso por parte de los Usuarios por razones no contempladas en las exclusiones del punto 4. Se excluyen de este cálculo los períodos de mantenimiento programado.

**2.3. Medición**

La disponibilidad es monitoreada de forma continua mediante herramientas de monitoreo externas. [COMPLETAR: si se dispone de un panel de estado público, indicar la URL, por ej.: https://status.conectartalento.com.ar]

---

### 3. COMPENSACIONES POR INCUMPLIMIENTO DEL SLA

Cuando la disponibilidad mensual sea inferior al 99%, el Usuario afectado tendrá derecho a las siguientes compensaciones en créditos de servicio:

| Disponibilidad mensual | Crédito de servicio |
|------------------------|---------------------|
| 98,00% – 98,99% | 10% del costo del mes afectado |
| 95,00% – 97,99% | 25% del costo del mes afectado |
| 90,00% – 94,99% | 50% del costo del mes afectado |
| Menos del 90,00% | 100% del costo del mes afectado |

**3.1. Naturaleza de los créditos**

Los créditos de servicio son acreditados como descuento en el siguiente período de facturación. No son reembolsables en dinero, salvo que el contrato sea rescindido por el Usuario dentro del mes en que se produzca el incumplimiento, en cuyo caso el Proveedor reembolsará el importe proporcional al período de inactividad no programada.

**3.2. Procedimiento de reclamación**

Para solicitar un crédito de servicio, el Usuario debe:
a) Presentar la solicitud dentro de los **30 (treinta) días corridos** siguientes al mes en que se produjo el incumplimiento;
b) Enviar la solicitud a conectar.rrhh.ar@gmail.com con el asunto "RECLAMACIÓN SLA — [mes/año]";
c) Incluir la siguiente información: correo electrónico de la cuenta, mes afectado, descripción de los períodos de inactividad experimentados.

El Proveedor responderá la solicitud dentro de los **10 (diez) días hábiles** siguientes y, de corresponder, acreditará el crédito en el siguiente período de facturación.

**3.3. Límite de compensaciones**

Las compensaciones establecidas en este artículo constituyen el único remedio del Usuario por el incumplimiento del SLA de disponibilidad, sin perjuicio de lo establecido en el artículo 16 (Limitación de Responsabilidad) de los Términos y Condiciones Generales. El total de créditos de servicio en un mes calendario no podrá superar el 100% del importe mensual abonado por el Usuario.

---

### 4. EXCLUSIONES — INACTIVIDAD NO COMPUTABLE

No se considerará "inactividad" computable a los efectos del SLA la originada por:

**4.1. Mantenimiento programado**

Períodos de mantenimiento previamente comunicados al Usuario con al menos **48 (cuarenta y ocho) horas** de antelación mediante correo electrónico y/o aviso en la Plataforma. El mantenimiento programado no excederá de **8 (ocho) horas mensuales**, preferentemente realizadas en horario de menor tráfico (entre las 02:00 y las 06:00 horas, hora de Buenos Aires).

**4.2. Mantenimiento de emergencia**

Actuaciones de mantenimiento de emergencia necesarias para preservar la seguridad, integridad o disponibilidad de la Plataforma o de los datos de los usuarios, ante amenazas inmediatas (ataques de seguridad, vulnerabilidades críticas, entre otros). El Proveedor notificará al Usuario lo antes posible en estos casos.

**4.3. Fuerza mayor**

Eventos de fuerza mayor conforme al Artículo 21 de los Términos y Condiciones Generales.

**4.4. Causas imputables al Usuario o a terceros**

- Problemas de conectividad a Internet del lado del Usuario;
- Acciones del Usuario que causen la inactividad (uso indebido, configuraciones incorrectas, ataques originados en la cuenta del Usuario);
- Fallas en servicios de terceros no contratados por el Proveedor que el Usuario utilice junto con la Plataforma.

**4.5. Incidentes de baja escala**

Períodos de inactividad de duración inferior a **5 (cinco) minutos** consecutivos.

---

### 5. SOPORTE TÉCNICO

**5.1. Canales de soporte**

ConectAr Talento ofrece los siguientes canales de soporte técnico:

- **Correo electrónico:** conectar.rrhh.ar@gmail.com
- **[COMPLETAR: sistema de tickets / chat en vivo si se implementa]**
- **Centro de ayuda:** [COMPLETAR: URL si existe]

**5.2. Tiempos de respuesta por plan**

| Plan | Canal | Tiempo de primera respuesta |
|------|-------|----------------------------|
| Starter | Email | 3 días hábiles |
| Pro | Email | 2 días hábiles |
| Business | Email + Chat | 1 día hábil |
| Enterprise | Dedicado | [COMPLETAR según contrato Enterprise] |

Los tiempos de primera respuesta se cuentan en días hábiles (lunes a viernes, 9:00 a 18:00 horas, hora de Buenos Aires), excluyendo feriados nacionales argentinos.

**5.3. Clasificación de incidentes**

| Severidad | Definición | Tiempo de resolución objetivo |
|-----------|------------|------------------------------|
| Crítica | La Plataforma es completamente inaccesible o hay pérdida de datos | 4 horas hábiles |
| Alta | Funcionalidad principal gravemente degradada | 1 día hábil |
| Media | Funcionalidad secundaria no disponible | 3 días hábiles |
| Baja | Errores menores o consultas | 5 días hábiles |

Los tiempos de resolución son objetivos de buena fe; no generan compensaciones adicionales a las del punto 3 salvo acuerdo expreso en el caso del Plan Enterprise.

---

### 6. COPIAS DE SEGURIDAD (BACKUPS)

**6.1. Frecuencia y retención**

ConectAr Talento realiza copias de seguridad automatizadas de los datos de la Plataforma con la siguiente frecuencia y retención:

- **Backups diarios:** retención durante **[COMPLETAR: 7/14/30] días**
- **Backups semanales:** retención durante **[COMPLETAR: 4 semanas]**
- **[COMPLETAR según la configuración técnica de Supabase]**

**6.2. Objetivo de recuperación**

- **RPO (Recovery Point Objective — máxima pérdida de datos tolerable):** [COMPLETAR: ej. 24 horas]
- **RTO (Recovery Time Objective — tiempo máximo de recuperación):** [COMPLETAR: ej. 4 horas para incidentes críticos]

**6.3. Restauración de datos**

La restauración de datos a partir de backups es un proceso gestionado por el equipo técnico del Proveedor. El Usuario puede solicitar la restauración de datos ante un incidente, siendo el tiempo de respuesta equivalente al de un incidente de severidad "Alta" o "Crítica" según la urgencia. [COMPLETAR: indicar si la restauración está disponible como funcionalidad de autoservicio o solo bajo solicitud al soporte]

---

### 7. MODIFICACIONES AL SLA

El Proveedor podrá modificar el presente SLA con un preaviso de **30 (treinta) días**, notificando al Usuario conforme al procedimiento del Artículo 20 de los Términos y Condiciones Generales.

---

**Versión:** 1.0 | **Fecha de vigencia:** 01/06/2026

─────────────────────────────────────────────────────────────
FIN DOCUMENTO 7
