import React from "react";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  blue: {
    color: "blue",
    fontSize: 10,
    fontWeight: "bold",
  },
});

const toTitleCase = (text = "") => {
  return text
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const HojaSolvenciaPDF = ({ data }) => {
  const primerEmpleado = (data.empleados || "").split(",")[0]?.trim() || "";
  const empleadoParts = primerEmpleado.split(" - ").map((p) => p.trim());

  const codigoEmpleado = empleadoParts[0] || "";
  const nombreEmpleado = empleadoParts[1] || "";
  const puestoEmpleado = empleadoParts[2] || "";
  const departamentoEmpleado = empleadoParts.slice(3).join(" - ");

  const jefeParts = (data.jefeInmediato || "").split(" - ").map((p) => p.trim());
  const jefeNombre = jefeParts[0] || "";
  const jefePuesto = jefeParts.slice(1).join(" - ");

  const fechaSolvencia = data.fechaSolvencia ? new Date(data.fechaSolvencia) : new Date();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 10,
            marginTop: -25,
          }}
        >
          <Image
            src="/logo_guandy.png"
            style={{ width: 70, height: 110, objectFit: "contain" }}
          />

          <View style={{ flex: 1, alignItems: "center", marginTop: -10 }}>
            <Text style={{ fontSize: 11, fontWeight: "bold", marginVertical: 2 }}>
              Guatemalan Candies, S.A.
            </Text>
            <Text style={{ fontSize: 9, marginVertical: 1 }}>
              Administración de Equipos IT
            </Text>
            <Text style={{ fontSize: 9, marginVertical: 1 }}>
              Solvencia de Equipo de Cómputo
            </Text>
          </View>

          <View style={{ alignItems: "flex-end", marginTop: -10 }}>
            <Text style={{ fontSize: 9 }}>Solvencia No:</Text>
            <Text style={{ fontSize: 11, fontWeight: "bold", marginTop: 1, color: "red" }}>
              {data.solvenciaNo}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: -5, marginBottom: 10 }}>
          <Text style={{ textAlign: "center", fontSize: 9, marginBottom: 6 }}>
            De acuerdo a controles internos el día{" "}
            <Text style={styles.blue}>{fechaSolvencia.getDate()}</Text> de{" "}
            <Text style={styles.blue}>
              {fechaSolvencia.toLocaleDateString("es-ES", { month: "long" })}
            </Text>{" "}
            del <Text style={styles.blue}>{fechaSolvencia.getFullYear()}</Text>.
          </Text>

          <Text
            style={{
              textAlign: "center",
              fontSize: 9,
              marginBottom: 4,
              fontWeight: "bold",
            }}
          >
            El infrascrito encargado del departamento de IT, Certifica que:
          </Text>
        </View>

        <View style={{ width: "100%", alignItems: "center", marginBottom: 10 }}>
          {[
            { label: "Nombre del empleado:", value: nombreEmpleado },
            { label: "Código del empleado:", value: codigoEmpleado },
            {
              label: "Quien se desempeñó como:",
              value: puestoEmpleado ? toTitleCase(puestoEmpleado) : "",
            },
            {
              label: "En el departamento:",
              value: departamentoEmpleado ? toTitleCase(departamentoEmpleado) : "",
            },
          ].map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                width: "90%",
                marginBottom: 5,
              }}
            >
              <Text
                style={{
                  width: "35%",
                  textAlign: "right",
                  fontSize: 10,
                  fontWeight: "bold",
                  paddingRight: 3,
                }}
              >
                {item.label}
              </Text>

              <Text
                style={{
                  width: "45%",
                  marginLeft: 8,
                  fontSize: 10,
                  color: "blue",
                  fontWeight: "bold",
                  borderBottom: "1px dotted black",
                }}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            backgroundColor: "#DFF3FF",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 4,
            marginBottom: 10,
            alignSelf: "center",
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: "bold", textAlign: "center" }}>
            Quien tenía a cargo: Mobiliario y equipo, según hoja de responsabilidad:
            <Text style={{ color: "red", fontWeight: "bold" }}> {data.hojaNo}</Text>
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: -3,
            marginBottom: 10,
            gap: 10,
          }}
        >
          <View
            style={{
              width: 30,
              height: 20,
              backgroundColor: "#FFD94A",
              border: "1px solid #000",
            }}
          />

          <Text style={{ fontSize: 11, fontWeight: "bold", textAlign: "center" }}>
            Está solvente ante el departamento de activos fijos
          </Text>
        </View>

        <View style={{ marginTop: 10, width: "100%", alignItems: "center" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "bold",
                maxWidth: "80%",
                textAlign: "center",
              }}
            >
              En este caso NO esté solvente, indique los motivos y cuantificación:
            </Text>
          </View>

          <View style={{ borderBottom: "1px solid #000", height: 14, width: "90%", marginTop: 6 }} />
          <View style={{ borderBottom: "1px solid #000", height: 14, width: "90%", marginTop: 6 }} />
          <View style={{ borderBottom: "1px solid #000", height: 14, width: "90%", marginTop: 6 }} />
        </View>

        <View
          style={{
            border: "1px solid #000",
            marginTop: 15,
            width: "100%",
            flexDirection: "row",
          }}
        >
          <View style={{ flex: 0.6, borderRight: "1px solid #000" }}>
            <Text
              style={{
                fontSize: 9,
                fontWeight: "bold",
                textAlign: "center",
                padding: 3,
                borderBottom: "1px solid #000",
                color: "blue",
                backgroundColor: "#E6F3FF",
              }}
            >
              Estado
            </Text>

            {["Bueno", "Regular", "Malo"].map((item, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 5,
                }}
              >
                <View style={{ width: 10, height: 10, border: "1px solid #000" }} />
                <Text style={{ fontSize: 9, marginLeft: 5 }}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={{ flex: 0.6, borderRight: "1px solid #000" }}>
            <Text
              style={{
                fontSize: 9,
                fontWeight: "bold",
                textAlign: "center",
                padding: 3,
                borderBottom: "1px solid #000",
                color: "blue",
                backgroundColor: "#E6F3FF",
              }}
            >
              Accesorios
            </Text>

            {["Completo", "Incompleto", "Otro"].map((item, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 5,
                }}
              >
                <View style={{ width: 10, height: 10, border: "1px solid #000" }} />
                <Text style={{ fontSize: 9, marginLeft: 5 }}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={{ flex: 1.8 }}>
            <Text
              style={{
                fontSize: 9,
                fontWeight: "bold",
                textAlign: "center",
                padding: 3,
                borderBottom: "1px solid #000",
                color: "blue",
                backgroundColor: "#E6F3FF",
              }}
            >
              Comentarios adicionales
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 15, width: "100%" }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 5 }}>
            Observaciones:
          </Text>

          <View style={{ borderBottom: "1px solid #000", height: 15 }} />
          <View style={{ borderBottom: "1px solid #000", height: 15, marginTop: 5 }} />
        </View>

        <View
          style={{
            width: "100%",
            marginTop: 25,
            alignItems: "center",
          }}
        >
          {[1, 2, 3].map((row) => (
            <View
              key={row}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "95%",
                marginBottom: 25,
              }}
            >
              {[1, 2].map((col) => {
                if (row === 1 && col === 1) {
                  return (
                    <View key={col} style={{ width: "45%", alignItems: "center" }}>
                      <View style={{ width: "100%", borderBottom: "1px dotted black", height: 20 }} />

                      <Text
                        style={{
                          fontSize: 9,
                          marginTop: 4,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Responsable de quien entrega:
                      </Text>

                      <Text style={{ fontSize: 9, textAlign: "center", color: "blue" }}>
                        {nombreEmpleado}
                      </Text>

                      <Text style={{ fontSize: 9, textAlign: "center" }}>
                        {toTitleCase(puestoEmpleado)}
                      </Text>
                    </View>
                  );
                }

                if (row === 1 && col === 2) {
                  return (
                    <View key={col} style={{ width: "45%", alignItems: "center" }}>
                      <View style={{ width: "100%", borderBottom: "1px dotted black", height: 20 }} />

                      <Text
                        style={{
                          fontSize: 9,
                          marginTop: 4,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Jefe Inmediato:
                      </Text>

                      <Text style={{ fontSize: 9, textAlign: "center", color: "blue" }}>
                        {jefeNombre}
                      </Text>

                      <Text style={{ fontSize: 9, textAlign: "center" }}>
                        {jefePuesto}
                      </Text>
                    </View>
                  );
                }

                if (row === 2 && col === 1) {
                  return (
                    <View key={col} style={{ width: "45%", alignItems: "center" }}>
                      <View style={{ width: "100%", borderBottom: "1px dotted black", height: 20 }} />

                      <Text
                        style={{
                          fontSize: 9,
                          marginTop: 4,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Realizado por:
                      </Text>

                      <Text style={{ fontSize: 9, textAlign: "center", color: "blue" }}>
                        Kleidy López
                      </Text>

                      <Text style={{ fontSize: 9, textAlign: "center" }}>
                        Asistente IT
                      </Text>
                    </View>
                  );
                }

                if (row === 2 && col === 2) {
                  return (
                    <View key={col} style={{ width: "45%", alignItems: "center" }}>
                      <View style={{ width: "100%", borderBottom: "1px dotted black", height: 20 }} />

                      <Text
                        style={{
                          fontSize: 9,
                          marginTop: 4,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Enterado:
                      </Text>

                      <Text style={{ fontSize: 9, textAlign: "center", color: "blue" }}>
                        Rodrigo Araneda
                      </Text>

                      <Text style={{ fontSize: 9, textAlign: "center" }}>
                        Recursos Humanos
                      </Text>
                    </View>
                  );
                }

                if (row === 3 && col === 1) {
                  return (
                    <View key={col} style={{ width: "45%", alignItems: "center" }}>
                      <View style={{ width: "100%", borderBottom: "1px dotted black", height: 20 }} />

                      <Text
                        style={{
                          fontSize: 9,
                          marginTop: 4,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Responsable que revisa y recibe:
                      </Text>

                      <Text style={{ fontSize: 9, textAlign: "center", color: "blue" }}>
                        Edwin Giovanni Artiga
                      </Text>

                      <Text style={{ fontSize: 9, textAlign: "center" }}>
                        Asistente IT
                      </Text>
                    </View>
                  );
                }

                if (row === 3 && col === 2) {
                  return (
                    <View key={col} style={{ width: "45%", alignItems: "center" }}>
                      <View style={{ width: "100%", borderBottom: "1px dotted black", height: 20 }} />

                      <Text
                        style={{
                          fontSize: 9,
                          marginTop: 4,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        Enterado:
                      </Text>

                      <Text style={{ fontSize: 9, textAlign: "center", color: "blue" }}>
                        Carlos Mazariegos
                      </Text>

                      <Text style={{ fontSize: 9, textAlign: "center" }}>
                        Gerente de Sistemas
                      </Text>
                    </View>
                  );
                }

                return null;
              })}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default HojaSolvenciaPDF;