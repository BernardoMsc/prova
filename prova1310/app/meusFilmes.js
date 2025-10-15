import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from "react";
import { router } from "expo-router";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("filmes.db");

db.execSync(`
    PRAGMA journal_mode = WAL;
    DROP TABLE IF EXISTS filmes;
    CREATE TABLE IF NOT EXISTS filmes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        genero TEXT NOT NULL,
        ano REAL NOT NULL
    );
`);

function getFilmes() {
  return db.getAllSync("SELECT * FROM filmes");
}

function insertFilmes(titulo, genero, ano) {
  db.runSync(
    "INSERT INTO filmes (titulo, genero, ano) VALUES (?, ?, ?)",
    [titulo, genero, ano]
  );
}

function deleteFilmes(id) {
  db.runSync("DELETE FROM filmes WHERE id = ?", [id]);
}

function deleteAll() {
  db.runSync("DELETE FROM filmes");
}

function getFilmesById(id) {
  const [filmes] = db.getAllSync('SELECT * FROM filmes WHERE id = ?', [id]);
  return filmes;
}


function updateFilmes(id, titulo, genero, ano) {
  db.runSync('UPDATE filmes SET titulo = ?, genero = ?, ano = ? WHERE id = ?', [titulo, genero, ano, id]);
}

export default function SqliteFilmes() {
  const [titulo, setTitulo] = useState("");
  const [genero, setGenero] = useState("");
  const [ano, setAno] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [filmes, setFilmes] = useState(getFilmes());



  function salvarOuAtualizar() {
    const titu = titulo.trim();
    const gen = genero.trim();
    const ano1 = parseFloat(ano);

    if (!titu) {
      alert("O titulo não pode estar vazio.");
      return;
    }

    if (isNaN(ano1) || ano1 == "" ) {
      alert("Insira 9999 se não for usar nenhum número.");
      return;
    }

    if (editandoId !== null) {
      updateFilmes(editandoId, titu, gen, ano1);
      setEditandoId(null);
    } else {
      insertFilmes(titu, gen, ano1);
    }

    setTitulo("");
    setGenero("");
    setAno("");
    carregarFilmes();

  }

  function carregarFilmes() {
    setFilmes(getFilmes());
  }

  function deletar(id) {
    deleteFilmes(id);
    carregarFilmes();
  }

  function limparTudo() {
    deleteAll();
    carregarFilmes();
  }

  function editarFilmes(id) {
    const filme = getFilmesById(id);
    if (!filme) return;

    setTitulo(filme.titulo);
    setGenero(filme.genero);
    setAno(filme.ano.toString());
    setEditandoId(filme.id);
  }

  function cancelarEdicao() {
    setTitulo("");
    setGenero("");
    setAno("");
    setEditandoId(null);
  }


  useEffect(() => {
    carregarFilmes();
  }, []);


  return (
    <SafeAreaView style={estilos.container}>
      <Text style={estilos.titulo}>Filmes</Text>

      <View style={estilos.linhaEntrada}>
        <TextInput
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Titulo"
          style={estilos.campoTexto}
        />
      </View>

      <View style={estilos.linhaEntrada}>
        <TextInput
          value={genero}
          onChangeText={setGenero}
          placeholder="Genero"
          style={estilos.campoTexto}
        />
      </View>

      <View style={estilos.linhaEntrada}>
        <TextInput
          value={ano}
          onChangeText={setAno}
          placeholder="Ano do Filme"
          keyboardType="numeric"
          style={estilos.campoTexto}
        />
      </View>

      <View style={estilos.linhaEntrada}>
        <TouchableOpacity style={estilos.botao} onPress={salvarOuAtualizar}>
          <Text style={estilos.textoBotao}>{editandoId ? "Atualizar" : "Salvar"}</Text>
        </TouchableOpacity>
        {editandoId ? (
          <TouchableOpacity style={estilos.botaoCancelar} onPress={cancelarEdicao}>
            <Text style={estilos.textoBotaoCancelar}>Cancelar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={estilos.botaoSecundario} onPress={carregarFilmes}>
            <Text style={estilos.textoBotaoSecundario}>Carregar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={estilos.botaoExcluirTudo} onPress={limparTudo}>
          <Text style={estilos.textoExcluirTudo}>Apagar todas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filmes}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={estilos.item}>
            <Text style={estilos.textoItem}>
              {item.titulo} - {item.genero} - {item.ano}
            </Text>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() => editarFilmes(item.id)}
                style={estilos.botaoEditar}
              >
                <Text style={estilos.textoExcluir}>E</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deletar(item.id)}
                style={estilos.botaoExcluir}
              >
                <Text style={estilos.textoExcluir}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={estilos.rodape}>
        <TouchableOpacity style={estilos.botaoRodape} onPress={() => router.replace("/")}>
          <Text style={estilos.textoBotao}>Início</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  linhaEntrada: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  campoTexto: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  botao: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  botaoSecundario: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  textoBotaoSecundario: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  botaoCancelar: {
    backgroundColor: "#757575",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  textoBotaoCancelar: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  item: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textoItem: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  botaoExcluir: {
    backgroundColor: "#e53935",
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  textoExcluir: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  botaoEditar: {
    backgroundColor: "#29e902ff",
    padding: 8,
    borderRadius: 8,
  },
  rodape: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 20,
  },
  botaoRodape: {
    backgroundColor: "#9C27B0",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  botaoExcluirTudo: {
    backgroundColor: "#b71c1c",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  textoExcluirTudo: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    color: "#333",
  },

});