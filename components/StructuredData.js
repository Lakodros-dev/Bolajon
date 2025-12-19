export default function StructuredData() {
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: 'Bolajon.uz',
        url: 'https://bolajoon.uz',
        logo: 'https://bolajoon.uz/logo.png',
        description: "5-9 yoshli bolalarga ingliz tilini o'yinlar va interaktiv video darslar orqali o'rgatish platformasi",
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'UZ',
        },
        sameAs: [],
    };

    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Bolajon.uz',
        url: 'https://bolajoon.uz',
        description: "Bolalar uchun ingliz tili o'rgatish platformasi",
        inLanguage: 'uz',
        potentialAction: {
            '@type': 'SearchAction',
            target: 'https://bolajoon.uz/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
        },
    };

    const courseSchema = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: "Bolalar uchun ingliz tili kursi",
        description: "5-9 yoshli bolalar uchun interaktiv ingliz tili kursi",
        provider: {
            '@type': 'Organization',
            name: 'Bolajon.uz',
            url: 'https://bolajoon.uz',
        },
        educationalLevel: 'Beginner',
        audience: {
            '@type': 'EducationalAudience',
            educationalRole: 'student',
            audienceType: 'Children aged 5-9',
        },
        inLanguage: ['uz', 'en'],
        isAccessibleForFree: false,
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
            />
        </>
    );
}
