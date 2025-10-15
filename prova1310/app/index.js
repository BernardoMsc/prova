import { useState } from "react";
import { View, Text, Button } from "react-native";
import { Link } from "expo-router";

export default function Home() {

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 10 }}>
      <Text style={{ fontSize: 30, fontWeight: "black" }}>MENU</Text>
      <Link href="/meusFilmes" asChild>
        <Button title="Meus Filmes" />
      </Link>

    </View>
  );
}