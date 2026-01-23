"use client";
import { supabase } from '@/lib/supabase';
import { useState } from 'react';


export default function test() {
    const [judul, setJudul] = useState("");
    const [deskripsi, setDesc] = useState("");
    const [view, setView] = useState(0);

    const submit = async(e) => {
        e.preventDefault();

        const {data, error} = await supabase
        .from('komik')
        .insert([{ judul_buku: judul, deskripsi: deskripsi, view: view}]);


        if(error) {
            alert(error.message);
        } else {
            alert("data berhasil ditambahkan!");
        }

        if(view >= 500000) {
            const {data: populer, error: errorPopuler} = await supabase
            .from('komik_populer')
            .insert([{ judul_buku: judul, deskripsi: deskripsi, viewer: view }]);

            if(errorPopuler) {
                alert(errorPopuler.message);
            } else {
                alert("data berhasil masuk ke komik populer", populer);
            }
        }
        setJudul("");
        setDesc("");
    };
    return(
        <form onSubmit={submit}>
            <label htmlFor="judul">Judul Buku</label>
            <input type="text" id='judul' value={judul} onChange={(e) => setJudul(e.target.value)} required/>
            <label htmlFor="desk">Deskripsi</label>
            <input type="text" value={deskripsi} onChange={(e) => setDesc(e.target.value)} required/>
            <label htmlFor="view">Views</label>
            <input type="number" onChange={(e) => setView(Number(e.target.value))} required/>
            <button type='submit'>Submit</button>
        </form>
    )

}

