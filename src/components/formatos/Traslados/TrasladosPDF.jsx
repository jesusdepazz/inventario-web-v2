import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontSize: 9,
        fontFamily: "Helvetica",
    },

    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginBottom: 10,
    },

    colLeft: {
        width: "25%",
        alignItems: "flex-start",
    },

    colCenter: {
        width: "50%",
        alignItems: "center",
        textAlign: "center",
    },

    colRight: {
        width: "25%",
        alignItems: "flex-end",
    },

    logo: {
        width: 90,
        height: 60,
    },

    companyName: {
        fontSize: 9,
        fontWeight: "bold",
        textAlign: "center",
        color: "black",
    },

    registro: {
        fontSize: 9,
        fontWeight: "bold",
        textAlign: "center",
        color: "black",
    },

    tituloDocumento: {
        fontSize: 9,
        fontWeight: "bold",
        textAlign: "center",
        color: "black",
    },

    correlativo: {
        fontSize: 8,
        fontWeight: "bold",
        color: "red",
        textAlign: "right",
    },

    tableContainer: {
        width: "100%",
        borderLeft: "1px solid #000",
        borderRight: "1px solid #000",
        borderTop: "1px solid #000",
        borderBottom: "none",
    },

    tableRow: {
        flexDirection: "row",
    },

    tableCellLabel: {
        width: "40%",
        backgroundColor: "#d9d9d9",
        padding: 4,
        borderRight: "1px solid #000",
        fontWeight: "bold",
    },

    tableCellValue: {
        width: "60%",
        padding: 4,
        color: "blue"
    },

    sectionHeader: {
        width: "100%",
        backgroundColor: "#003366",
        padding: 4,
        borderLeft: "1px solid #000",
        borderRight: "1px solid #000",
        borderTop: "1px solid #000",
    },

    sectionHeaderText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 9,
    },

    fourColRow: {
        flexDirection: "row",
        width: "100%",
        borderLeft: "1px solid #000",
        borderRight: "1px solid #000",
        borderBottom: "1px solid #000",
    },

    fourColLabel: {
        width: "20%",
        backgroundColor: "#d9d9d9",
        padding: 6,
        borderRight: "1px solid #000",
        fontWeight: "bold",
        fontSize: 10,
    },

    fourColValue: {
        width: "30%",
        padding: 6,
        borderRight: "1px solid #000",
        fontSize: 9,
        backgroundColor: "#ffde21",
    },
    motivoRow: {
        width: "100%",
        borderLeft: "1px solid #000",
        borderRight: "1px solid #000",
        borderBottom: "1px solid #000",
        padding: 6,
        minHeight: 20,
        justifyContent: "center",
    },

    motivoText: {
        fontSize: 10,
        textAlign: "center",
        color: "blue",
        fontWeight: "bold",
    },

    twoColHeader: {
        flexDirection: "row",
        width: "100%",
        borderLeft: "1px solid #000",
        borderRight: "1px solid #000",
        borderBottom: "1px solid #000",
    },

    twoColHeaderCell: {
        width: "50%",
        backgroundColor: "#003366",
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        padding: 6,
        borderRight: "1px solid #000",
        fontSize: 11,
    },

    fourColHeader: {
        flexDirection: "row",
        border: "1px solid black",
        backgroundColor: "#f0f0f0"
    },
    headerCell: {
        flex: 2,
        fontSize: 9,
        fontWeight: "bold",
        textAlign: "center",
        padding: 4,
        borderRight: "1px solid black"
    },

    fourColRowEmpl: {
        flexDirection: "row",
        borderLeft: "1px solid black",
        borderRight: "1px solid black",
        borderBottom: "1px solid black"
    },

    labelCell: {
        fontSize: 9,
        fontWeight: "bold",
        padding: 4,
        borderRight: 1,
        borderBottom: 1,
        borderColor: "#000",
        minWidth: 95,
        textAlign: "left",
        backgroundColor: "#d9d9d9",
    },

    valueCell: {
        fontSize: 9,
        padding: 4,
        borderRight: 1,
        borderBottom: 1,
        borderColor: "#000",
        flex: 1,
        backgroundColor: "#ffde21",
    },

    sixColRow: {
        flexDirection: "row",
        width: "100%",
        borderLeft: "1px solid #000",
        borderRight: "1px solid #000",
        borderBottom: "1px solid #000",
    },

    sixColHeader: {
        width: "16.66%",
        backgroundColor: "#d9d9d9",
        padding: 3,
        borderRight: "1px solid #000",
        fontWeight: "bold",
        fontSize: 7,
        textAlign: "center",
    },

    sixColValue: {
        width: "16.66%",
        padding: 3,
        borderRight: "1px solid #000",
        fontSize: 7,
        textAlign: "center",
    },

    twoColSignRow: {
        flexDirection: "row",
        width: "100%",
        borderLeft: "1px solid #000",
        borderRight: "1px solid #000",
        borderBottom: "1px solid #000",
    },

    signCell: {
        width: "50%",
        height: 60,
        borderRight: "1px solid #000",
        position: "relative",
    },

    signFooter: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 14,
        backgroundColor: "#d9d9d9",
        borderTop: "1px solid #000",
        justifyContent: "center",
        alignItems: "center",
    },

    signFooterText: {
        fontSize: 7,
        fontWeight: "bold",
    },

});

const wrapText = (text = "", max = 25) => {
    if (!text) return "";
    const regex = new RegExp(`(.{1,${max}})`, "g");
    return text.match(regex).join("\n");
};

const formatSpanishDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const dias = [
        "domingo", "lunes", "martes", "miércoles",
        "jueves", "viernes", "sábado",
    ];

    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ];

    const diaSemana = dias[date.getDay()];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const año = date.getFullYear();

    return `${capitalizeFirstWord(diaSemana)}, ${dia} de ${mes} de ${año}`;
};

const capitalizeFirstWord = (text = "") =>
    text.charAt(0).toUpperCase() + text.slice(1);


const PdfTraslados = ({ data = {} }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.headerContainer}>
                <View style={styles.colLeft}>
                    <Image src="/logo_guandy.png" style={styles.logo} />
                </View>
                <View style={styles.colCenter}>
                    <Text style={styles.companyName}>
                        Guatemalan Candies, S.A.
                    </Text>
                    <Text style={styles.registro}>
                        Registro
                    </Text>
                    <Text style={styles.tituloDocumento}>
                        Movimiento de Equipos de Computo
                    </Text>
                </View>
                <View style={styles.colRight}>
                    <Text style={styles.correlativo}>
                        Correlativo Serie “IT” No. {data?.no || ""}
                    </Text>
                </View>
            </View>
            <View style={styles.tableContainer}>
                <View style={styles.tableRow}>
                    <Text style={styles.tableCellLabel}>
                        FECHA DE SOLICITUD
                    </Text>
                    <Text style={styles.tableCellValue}>
                        {formatSpanishDate(data?.fechaEmision)}
                    </Text>
                </View>
            </View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>
                    UBICACIÓN
                </Text>
            </View>
            <View style={styles.fourColRow}>
                <Text style={styles.fourColLabel}>
                    2.1 Desde:
                </Text>
                <Text style={styles.fourColValue}>
                    {data?.ubicacionDesde || ""}
                </Text>

                <Text style={styles.fourColLabel}>
                    2.2 Hacia:
                </Text>
                <Text style={[styles.fourColValue, { borderRight: "none", }]}>
                    {data?.ubicacionHasta || ""}
                </Text>
            </View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>
                    MOTIVO DE TRASLADO:
                </Text>
            </View>
            <View style={styles.motivoRow}>
                <Text style={styles.motivoText}>
                    {data?.motivo || ""}
                </Text>
            </View>
            <View style={styles.twoColHeader}>
                <Text style={styles.twoColHeaderCell}>
                    RESPONSABLE QUE ENTREGA
                </Text>
                <Text style={[styles.twoColHeaderCell, { borderRight: "none" }]}>
                    RESPONSABLE QUE RECIBE
                </Text>
            </View>

            <View style={styles.fourColRow}>
                <Text style={styles.labelCell}>CÓDIGO:</Text>
                <Text style={styles.valueCell}>
                    {data?.empleadoEntrega?.codigo || ""}
                </Text>

                <Text style={styles.labelCell}>CÓDIGO:</Text>
                <Text style={[styles.valueCell, { borderRight: "none" }]}>
                    {data?.empleadoRecibe?.codigo || ""}
                </Text>
            </View>

            <View style={styles.fourColRow}>
                <Text style={styles.labelCell}>NOMBRE:</Text>
                <Text style={styles.valueCell}>
                    {data?.empleadoEntrega?.nombre || ""}
                </Text>

                <Text style={styles.labelCell}>NOMBRE:</Text>
                <Text style={[styles.valueCell, { borderRight: "none" }]}>
                    {data?.empleadoRecibe?.nombre || ""}
                </Text>
            </View>

            <View style={styles.fourColRow}>
                <Text style={styles.labelCell}>PUESTO:</Text>
                <Text style={styles.valueCell}>
                    {data?.empleadoEntrega?.puesto || ""}
                </Text>

                <Text style={styles.labelCell}>PUESTO:</Text>
                <Text style={[styles.valueCell, { borderRight: "none" }]}>
                    {data?.empleadoRecibe?.puesto || ""}
                </Text>
            </View>

            <View style={styles.fourColRow}>
                <Text style={styles.labelCell}>DEPARTAMENTO:</Text>
                <Text style={styles.valueCell}>
                    {data?.empleadoEntrega?.departamento || ""}
                </Text>

                <Text style={styles.labelCell}>DEPARTAMENTO:</Text>
                <Text style={[styles.valueCell, { borderRight: "none" }]}>
                    {data?.empleadoRecibe?.departamento || ""}
                </Text>
            </View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>
                    DESCRIPCIÓN DE EQUIPO A TRASLADAR
                </Text>
            </View>
            <View style={styles.sixColRow}>
                <Text style={styles.sixColHeader}>CANTIDAD</Text>
                <Text style={styles.sixColHeader}>NO. INVENTARIO (ID ACTIVO)</Text>
                <Text style={styles.sixColHeader}>EQUIPO</Text>
                <Text style={styles.sixColHeader}>MARCA</Text>
                <Text style={styles.sixColHeader}>MODELO</Text>
                <Text style={[styles.sixColHeader, { borderRight: "none" }]}>
                    SERIE
                </Text>
            </View>
            {data?.equipos?.length > 0 &&
                data.equipos.map((eq, index) => (
                    <View key={index} style={styles.sixColRow}>
                        <Text style={styles.sixColValue}>{index + 1}</Text>
                        <Text style={styles.sixColValue}>
                            {eq.equipo || ""}
                        </Text>
                        <Text style={styles.sixColValue}>
                            {eq.descripcionEquipo || ""}
                        </Text>
                        <Text style={styles.sixColValue}>
                            {eq.marca || ""}
                        </Text>
                        <Text style={styles.sixColValue}>
                            {eq.modelo || ""}
                        </Text>
                        <Text
                            style={[
                                styles.sixColValue,
                                {
                                    borderRight: "none",
                                    fontSize: 6,
                                    textAlign: "left",
                                    lineHeight: 1.1,
                                },
                            ]}
                        >
                            {wrapText(eq.serie, 25)}
                        </Text>
                    </View>
                ))}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>
                    OBSERVACIONES:
                </Text>
            </View>
            <View style={styles.motivoRow}>
                <Text style={styles.motivoText}>
                    {data?.observaciones || ""}
                </Text>
            </View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>
                    FIRMAS DE AUTORIZACIÓN:
                </Text>
            </View>
            <View style={styles.twoColSignRow}>
                <View style={styles.signCell}>
                    <View style={styles.signFooter}>
                        <Text style={styles.signFooterText}>
                            NOMBRE Y FIRMA SOLICITANTE
                        </Text>
                    </View>
                </View>
                <View style={[styles.signCell, { borderRight: "none" }]}>
                    <View style={styles.signFooter}>
                        <Text style={styles.signFooterText}>
                            NOMBRE Y FIRMA - ENTERADO
                        </Text>
                    </View>
                </View>
            </View>
            <View style={styles.twoColSignRow}>
                <View style={styles.signCell}>
                    <View style={styles.signFooter}>
                        <Text style={styles.signFooterText}>
                            ASISTENTE IT
                        </Text>
                    </View>
                </View>

                <View style={[styles.signCell, { borderRight: "none" }]}>
                    <View style={styles.signFooter}>
                        <Text style={styles.signFooterText}>
                            NOMBRE Y FIRMA DE RECIBIDO CONFORME
                        </Text>
                    </View>
                </View>
            </View>
            <View style={styles.twoColSignRow}>
                <View style={styles.signCell}>
                    <View style={styles.signFooter}>
                        <Text style={styles.signFooterText}>
                            AUTORIZADO GERENCIA DE PLANTA/ GERENTE FINANCIERO/ JEFE DE RRHH
                        </Text>
                    </View>
                </View>

                <View style={[styles.signCell, { borderRight: "none" }]}>
                    <View style={styles.signFooter}>
                        <Text style={styles.signFooterText}>
                            AUTORIZADO GERENCIA GENERAL
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.twoColSignRow}>
                <View style={styles.signCell}>
                    <View style={styles.signFooter}>
                        <Text style={styles.signFooterText}>
                            NOMBRE Y FORMA DE AGENTE DE SEGURIDAD - GARITA DE EGRESO
                        </Text>
                    </View>
                </View>

                <View style={[styles.signCell, { borderRight: "none" }]}>
                    <View style={styles.signFooter}>
                        <Text style={styles.signFooterText}>
                            NOMBRE Y FIRMA DE AGENTE DE SEGURIDAD - GARITA DE INGRESO
                        </Text>
                    </View>
                </View>
            </View>
        </Page>
    </Document>
);

export default PdfTraslados;
