import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule],
})
export class HomePage {
  pokemonName = '';
  pokemonData: any = null;
  loading = false;
  error = '';
  review = '';

  private app = initializeApp(environment.firebaseConfig);
  private db = getFirestore(this.app);

  constructor(private http: HttpClient) {}

  searchPokemon() {
    this.loading = true;
    this.error = '';
    this.pokemonData = null;

    const name = this.pokemonName.toLowerCase().trim();

    this.http.get(`https://pokeapi.co/api/v2/pokemon/${name}`).subscribe({
      next: (data) => {
        this.pokemonData = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Pokémon no encontrado';
        this.loading = false;
      },
    });
  }
  async savePokemon() {
    if (!this.pokemonData) {
      this.error = 'Busca un Pokémon primero';
      return;
    }
    if (!this.review.trim()) {
      this.error = 'Escribe una reseña antes de guardar';
      return;
    }

    try {
      await addDoc(collection(this.db, 'pokemons'), {
        nombre: this.pokemonData.name,
        imageUrl: this.pokemonData.sprites.front_default,
        tipos: this.pokemonData.types.map((t: any) => t.type.name),
        vida:this.pokemonData.stats[0].base_stat,
        ataque: this.pokemonData.stats[1].base_stat,
        defensa: this.pokemonData.stats[2].base_stat,
        ataque_especial : this.pokemonData.stats[3].base_stat,
        defensa_especial : this.pokemonData.stats[4].base_stat,
        velocidad: this.pokemonData.stats[5].base_stat,
        reseña: this.review.trim(),
        createdAt: new Date()
      });
      this.error = '';
      alert('¡Pokémon guardado con reseña!');
      this.review = '';
    } catch (e) {
      this.error = 'Error al guardar en Firebase';
      console.error(e);
    }
  }
}
