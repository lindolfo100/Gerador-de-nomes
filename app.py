import streamlit as st
import pandas as pd
import plotly.express as px
import io

# --- CONFIGURAÇÃO DA PÁGINA ---
st.set_page_config(page_title="Monitoramento Escolar", layout="wide", page_icon="🏫")

# --- CARREGAMENTO E LIMPEZA DE DADOS ---
@st.cache_data
def load_data():
    # Lê o arquivo CSV
    df = pd.read_csv("dados_escola.csv", on_bad_lines='skip')

    # Remove as linhas de cabeçalho repetidas que estavam no meio do arquivo
    df = df[df['Estudante'] != 'Estudante']

    # Remove colunas vazias (que aparecem como Unnamed)
    df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

    # Converte colunas numéricas
    cols_numericas = ['Motivação', 'Acolhimento']
    for col in cols_numericas:
        df[col] = pd.to_numeric(df[col], errors='coerce')

    return df

df = load_data()

# --- SIDEBAR (FILTROS) ---
st.sidebar.header("🔍 Filtros")

# Filtro de Série
turmas = st.sidebar.multiselect(
    "Filtrar por Série/Turma:",
    options=df["Série"].unique(),
    default=df["Série"].unique()
)

# Filtro de Desempenho
if "Desempenho" in df.columns:
    desempenho = st.sidebar.multiselect(
        "Filtrar por Desempenho:",
        options=df["Desempenho"].dropna().unique(),
        default=df["Desempenho"].dropna().unique()
    )
    df_filtrado = df.query("`Série` in @turmas and `Desempenho` in @desempenho")
else:
    df_filtrado = df.query("`Série` in @turmas")


# --- KPIS PRINCIPAIS ---
total_alunos = len(df_filtrado)
media_motivacao = df_filtrado["Motivação"].mean()
media_acolhimento = df_filtrado["Acolhimento"].mean()

st.title("📊 Painel de Dados da Caravana")
st.markdown("Visão interativa sobre bem-estar, alimentação e desempenho.")

col1, col2, col3 = st.columns(3)
col1.metric("Total de Alunos", total_alunos)
col2.metric("Média de Motivação (1-5)", f"{media_motivacao:.2f}")
col3.metric("Média de Acolhimento (1-5)", f"{media_acolhimento:.2f}")

st.divider()

# --- ABAS PARA ORGANIZAÇÃO ---
tab1, tab2, tab3 = st.tabs(["📚 Acadêmico", "🍎 Saúde & Bem-estar", "📝 Observações & Futuro"])

with tab1:
    col_graf1, col_graf2 = st.columns(2)

    with col_graf1:
        st.subheader("Disciplinas Favoritas")
        if "Mais gosta 1" in df_filtrado.columns:
            # Limpeza rápida de nomes de matérias (padronização básica)
            df_materia = df_filtrado["Mais gosta 1"].astype(str).str.strip().str.title()
            contagem = df_materia.value_counts().head(10).reset_index()
            contagem.columns = ["Disciplina", "Quantidade"]
            fig_bar = px.bar(contagem, x="Quantidade", y="Disciplina", orientation='h', title="Top 10 Disciplinas Favoritas")
            st.plotly_chart(fig_bar, use_container_width=True)

    with col_graf2:
        st.subheader("Desempenho Declarado")
        if "Desempenho" in df_filtrado.columns:
            fig_desemp = px.pie(df_filtrado, names="Desempenho", title="Autoavaliação de Desempenho")
            st.plotly_chart(fig_desemp, use_container_width=True)

with tab2:
    col_saude1, col_saude2 = st.columns(2)

    with col_saude1:
        st.subheader("Qualidade do Sono")
        if "Dorme bem?" in df_filtrado.columns:
            fig_sono = px.bar(df_filtrado, x="Dorme bem?", color="Dorme bem?", title="Os alunos dormem bem?")
            st.plotly_chart(fig_sono, use_container_width=True)

    with col_saude2:
        st.subheader("Satisfação com Alimentação")
        if "Gosta da alimentação?" in df_filtrado.columns:
            # Simplificar respostas longas se houver
            df_alim = df_filtrado.copy()
            df_alim["Gosta da alimentação?"] = df_alim["Gosta da alimentação?"].astype(str).apply(lambda x: x[:20] + "..." if len(x) > 20 else x)
            fig_alim = px.pie(df_alim, names="Gosta da alimentação?", title="Gosta da Merenda?")
            st.plotly_chart(fig_alim, use_container_width=True)

with tab3:
    st.subheader("🚀 Profissões Desejadas")
    if "Profissão/Área desejada" in df_filtrado.columns:
        profissoes = df_filtrado["Profissão/Área desejada"].dropna().unique()
        st.write(", ".join(profissoes))

    st.divider()

    st.subheader("⚠️ Pontos de Atenção (Bullying e Melhorias)")
    cols_to_show = ["Estudante", "Série", "O que precisa melhorar", "Bullying"]
    # Filtra colunas que realmente existem
    cols_to_show = [c for c in cols_to_show if c in df_filtrado.columns]

    st.dataframe(
        df_filtrado[cols_to_show].dropna(subset=["O que precisa melhorar"]),
        use_container_width=True,
        hide_index=True
    )

# --- TABELA FINAL ---
st.divider()
with st.expander("Ver Base de Dados Completa"):
    st.dataframe(df_filtrado, hide_index=True)