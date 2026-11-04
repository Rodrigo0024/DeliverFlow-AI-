import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from apps.restaurants.models import MenuItem

class FoodRecommendationEngine:
    @staticmethod
    def get_recommended_items(item_id, top_n=3):
        """
        Recomenda pratos similares com base na descrição e categoria usando TF-IDF e Cosine Similarity.
        """
        items = MenuItem.objects.filter(is_available=True).values('id', 'name', 'description', 'price', 'restaurant__category')
        
        if not items.exists():
            return []

        df = pd.DataFrame(list(items))
        
        # Se o item buscado não existir na base, retorna vazio
        if not df['id'].isin([item_id]).any():
            return []

        # Cria uma tag combinando descrição e categoria para análise de texto
        df['combined_features'] = df['description'].fillna('') + ' ' + df['restaurant__category'].fillna('')

        # Vetorização TF-IDF das características dos pratos
        tfidf = TfidfVectorizer(stop_words='portuguese')
        tfidf_matrix = tfidf.fit_transform(df['combined_features'])

        # Calcula a similaridade de cosseno entre todos os pratos
        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

        # Encontra o índice do prato alvo
        idx = df[df['id'] == item_id].index[0]

        # Obtém as pontuações de similaridade para este prato
        sim_scores = list(enumerate(cosine_sim[idx]))

        # Ordena os pratos com base nas pontuações (do mais similar para o menos, excluindo ele mesmo)
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = [score for score in sim_scores if score[0] != idx][:top_n]

        # Pega os índices dos pratos recomendados
        item_indices = [i[0] for i in sim_scores]
        
        recommended_ids = df['id'].iloc[item_indices].tolist()
        
        # Retorna os objetos reais do Django
        return MenuItem.objects.filter(id__in=recommended_ids)